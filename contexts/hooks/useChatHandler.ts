import { useState } from 'react';
import { Conversation, Agent, AgentManager, Attachment, ManualSuggestion, Message, ConversationMode, LongTermMemoryData, PlanStep } from '../../types/index.ts';
import * as AgentService from '../../services/chat/agentService.ts';
import * as ManagerService from '../../services/chat/managerService.ts';
import * as MessageActionsService from '../../services/chat/messageActionsService.ts';
import * as TokenCounter from '../../services/utils/tokenCounter.ts';
import { ActionModalButton } from './useModalManager.ts';
import { AIError, getApiErrorMessage } from '../../services/utils/errorHandler.ts';

export type LoadingStage = 
    | { stage: 'idle' }
    | { stage: 'deciding' }
    | { stage: 'suggesting' }
    | { stage: 'generating', agentId?: string }
    | { stage: 'moderating' }
    | { stage: 'planning' }
    | { stage: 'executing_plan', agentId: string, task: string, current: number, total: number };


interface ChatHandlerProps {
    agents: Agent[];
    agentManager: AgentManager;
    globalApiKey: string;
    activeConversation: Conversation | null;
    conversationMode: ConversationMode;
    longTermMemory: LongTermMemoryData;
    onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
    onAppendToMessageText: (conversationId: string, messageId: string, textChunk: string) => void;
    onFinalizeMessage: (conversationId: string, messageId: string, finalMessageData: Partial<Message>) => void;
    openActionModal: (config: { title: string; content: string; actions?: ActionModalButton[] }) => void;
    closeActionModal: () => void;
    logUsage: (tokens: number, agentId?: string, requestCount?: number) => void;
    setLastTurnAgentIds: (ids: Set<string>) => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useChatHandler = ({ agents, agentManager, globalApiKey, activeConversation, conversationMode, longTermMemory, onUpdateConversation, onAppendToMessageText, onFinalizeMessage, openActionModal, closeActionModal, logUsage, setLastTurnAgentIds }: ChatHandlerProps) => {
    const [loadingStage, setLoadingStage] = useState<LoadingStage>({ stage: 'idle' });
    const [manualSuggestions, setManualSuggestions] = useState<ManualSuggestion[]>([]);
    
    const isChatLoading = loadingStage.stage !== 'idle';

    const handleSendMessage = async (text: string, attachment?: Attachment) => {
        if ((!text.trim() && !attachment) || isChatLoading || !activeConversation) return;

        const usedAgentIds = new Set<string>();
        setLastTurnAgentIds(new Set()); // Clear previous turn's agents immediately

        const conversationId = activeConversation.id;
        const userMessage: Message = { id: Date.now().toString(), text, sender: 'user', attachment, timestamp: new Date().toISOString() };
        
        let currentMessages = [...activeConversation.messages, userMessage];
        onUpdateConversation(conversationId, { messages: currentMessages });
        
        setManualSuggestions([]);
        
        const discussionSettings = activeConversation.discussionSettings;
        const managerSettings = activeConversation.managerSettings;
        const userMessageTokens = TokenCounter.estimateTokens(userMessage);
        logUsage(userMessageTokens, undefined, 0); // User message isn't an API request

        try {
            if (discussionSettings?.enabled) {
                // New Moderated Chat Logic
                let continueModeration = true;
                let turnCount = 0;
                const MAX_TURNS = 5; // Safety break

                do {
                    turnCount++;
                    if (turnCount > MAX_TURNS) {
                        console.warn("Max moderation turns reached. Exiting loop.");
                        const systemMessage: Message = { id: Date.now().toString() + '-err', sender: 'system', text: 'The conversation has reached its turn limit for this interaction. Please provide more input.', timestamp: new Date().toISOString()};
                        currentMessages = [...currentMessages, systemMessage];
                        onUpdateConversation(conversationId, { messages: currentMessages });
                        continueModeration = false;
                        break;
                    }

                    if (turnCount > 1) { // Don't delay the very first moderation action
                        await delay(1200); 
                    }

                    setLoadingStage({ stage: 'moderating' });
                    const moderationResponse = await ManagerService.moderateTurn(agents, currentMessages, agentManager, discussionSettings.rules, globalApiKey);

                    if (!moderationResponse.result) {
                        const systemMessage: Message = { id: Date.now().toString() + '-err', sender: 'system', text: 'The AI Moderator could not process the turn.', timestamp: new Date().toISOString(), pipeline: moderationResponse.pipeline };
                        currentMessages = [...currentMessages, systemMessage];
                        onUpdateConversation(conversationId, { messages: currentMessages });
                        continueModeration = false;
                        break;
                    }
                    
                    logUsage(0, 'manager', 1);
                    const { critique, decision, nextSpeakerAgentId, taskForNextSpeaker, rationale } = moderationResponse.result;

                    if (managerSettings?.showManagerInsights && rationale) {
                        const insightMessage: Message = { id: `${Date.now()}-insight`, sender: 'system', text: `**Rationale:** ${rationale}`, timestamp: new Date().toISOString(), pipeline: moderationResponse.pipeline, messageType: 'insight' };
                        currentMessages = [...currentMessages, insightMessage];
                        onUpdateConversation(conversationId, { messages: currentMessages });
                    }

                    if (critique) {
                        const critiqueMessage: Message = { id: `${Date.now()}-critique`, sender: 'system', text: `**Moderator's Note:** ${critique}`, timestamp: new Date().toISOString(), pipeline: moderationResponse.pipeline };
                        currentMessages = [...currentMessages, critiqueMessage];
                        onUpdateConversation(conversationId, { messages: currentMessages });
                    }

                    if (decision === 'speak' && nextSpeakerAgentId) {
                        const respondingAgent = agents.find(a => a.id === nextSpeakerAgentId);
                        if (!respondingAgent) {
                             continueModeration = false; // Agent not found, stop.
                             break;
                        }
                        usedAgentIds.add(nextSpeakerAgentId);
                        
                        setLoadingStage({ stage: 'generating', agentId: respondingAgent.id });
                        const aiMessageId = `${Date.now()}-ai-${turnCount}`;
                        const placeholderMessage: Message = { id: aiMessageId, text: '', sender: nextSpeakerAgentId, timestamp: new Date().toISOString(), isStreaming: true };
                        
                        currentMessages = [...currentMessages, placeholderMessage];
                        onUpdateConversation(conversationId, { messages: currentMessages });

                        const agentResponse = await AgentService.generateResponse('Continue the discussion.', respondingAgent, currentMessages, undefined, discussionSettings.rules, longTermMemory, (chunk) => onAppendToMessageText(conversationId, aiMessageId, chunk), taskForNextSpeaker || undefined, globalApiKey);
                        
                        const finalMessageData: Partial<Message> = { text: agentResponse.finalResult, isStreaming: false, pipeline: [...moderationResponse.pipeline, ...agentResponse.pipeline], responseTimeMs: agentResponse.pipeline.find(s => s.stage.startsWith('Model Invocation'))?.durationMs };
                        onFinalizeMessage(conversationId, aiMessageId, finalMessageData);

                        const finalMessage = { ...placeholderMessage, ...finalMessageData };
                        currentMessages = currentMessages.map(m => m.id === aiMessageId ? finalMessage : m) as Message[];
                        logUsage(TokenCounter.estimateTokens(finalMessage as Message), nextSpeakerAgentId, 1);

                    } else {
                        continueModeration = false;
                    }

                } while (continueModeration);

            } else if (conversationMode === 'Dynamic') {
                setLoadingStage({ stage: 'planning' });
                const planResponse = await ManagerService.generateDynamicPlan(text, agents, currentMessages, agentManager, globalApiKey);
                logUsage(0, 'manager', 1);
                
                if (planResponse.result.plan.length === 0) {
                    const systemMessage: Message = { 
                        id: Date.now().toString() + '-err', 
                        sender: 'system', 
                        text: 'The AI Manager could not formulate a plan for this request.', 
                        timestamp: new Date().toISOString(),
                        pipeline: planResponse.pipeline,
                    };
                    onUpdateConversation(conversationId, { messages: [...currentMessages, systemMessage]});
                    return;
                }

                if (managerSettings?.showManagerInsights && planResponse.result.planRationale) {
                    const insightMessage: Message = { id: `${Date.now()}-insight`, sender: 'system', text: `**Rationale:** ${planResponse.result.planRationale}`, timestamp: new Date().toISOString(), pipeline: planResponse.pipeline, messageType: 'insight' };
                    currentMessages = [...currentMessages, insightMessage];
                    onUpdateConversation(conversationId, { messages: currentMessages });
                }
                
                const planMessage: Message = {
                    id: `${Date.now()}-plan`,
                    sender: 'system',
                    text: `The AI Manager has formulated a plan to address your request.`,
                    timestamp: new Date().toISOString(),
                    plan: planResponse.result.plan,
                    pipeline: planResponse.pipeline,
                };
                
                currentMessages = [...currentMessages, planMessage];
                onUpdateConversation(conversationId, { messages: currentMessages });

                for (let i = 0; i < planResponse.result.plan.length; i++) {
                    await delay(1200); // Delay before every step to avoid rate-limiting
                    const step = planResponse.result.plan[i];
                    const respondingAgent = agents.find(a => a.id === step.agentId);
                    if (!respondingAgent) continue;
                    usedAgentIds.add(step.agentId);

                    setLoadingStage({ stage: 'executing_plan', agentId: step.agentId, task: step.task, current: i + 1, total: planResponse.result.plan.length });

                    const aiMessageId = `${Date.now()}-ai-${i}`;
                    const placeholderMessage: Message = { id: aiMessageId, text: '', sender: step.agentId, timestamp: new Date().toISOString(), isStreaming: true };
                    
                    currentMessages = [...currentMessages, placeholderMessage];
                    onUpdateConversation(conversationId, { messages: currentMessages });

                    const agentResponse = await AgentService.generateResponse('Based on the plan, execute your task.', respondingAgent, currentMessages, undefined, undefined, longTermMemory, (chunk) => onAppendToMessageText(conversationId, aiMessageId, chunk), step.task, globalApiKey);
                    
                    const finalMessageData: Partial<Message> = { text: agentResponse.finalResult, isStreaming: false, pipeline: agentResponse.pipeline, responseTimeMs: agentResponse.pipeline.find(s => s.stage.startsWith('Model Invocation'))?.durationMs };
                    onFinalizeMessage(conversationId, aiMessageId, finalMessageData);

                    const finalMessage = { ...placeholderMessage, ...finalMessageData };
                    currentMessages = [...currentMessages, finalMessage as Message];
                    logUsage(TokenCounter.estimateTokens(finalMessage as Message), step.agentId, 1);
                }
            } else if (conversationMode === 'AI') {
                setLoadingStage({ stage: 'deciding' });
                const managerResponse = await ManagerService.decideNextSpeaker(text, agents, currentMessages, agentManager, activeConversation.systemInstructionOverride, globalApiKey);
                logUsage(0, 'manager', 1);
                const nextSpeakerId = managerResponse.result;

                if (nextSpeakerId) {
                    const respondingAgent = agents.find(a => a.id === nextSpeakerId);
                    if (respondingAgent) {
                        usedAgentIds.add(nextSpeakerId);
                        setLoadingStage({ stage: 'generating', agentId: respondingAgent.id });
                        
                        const aiMessageId = `${Date.now()}-ai`;
                        const placeholderMessage: Message = { id: aiMessageId, text: '', sender: nextSpeakerId, timestamp: new Date().toISOString(), isStreaming: true };
                        onUpdateConversation(conversationId, { messages: [...currentMessages, placeholderMessage] });

                        const agentResponse = await AgentService.generateResponse(text, respondingAgent, currentMessages, attachment, activeConversation.systemInstructionOverride, longTermMemory, (chunk) => onAppendToMessageText(conversationId, aiMessageId, chunk), undefined, globalApiKey);
                        
                        onFinalizeMessage(conversationId, aiMessageId, {
                            text: agentResponse.finalResult,
                            pipeline: [...managerResponse.pipeline, ...agentResponse.pipeline],
                            isStreaming: false,
                            responseTimeMs: agentResponse.pipeline.find(s => s.stage.startsWith('Model Invocation'))?.durationMs,
                        });

                        logUsage(TokenCounter.estimateTokens({ ...placeholderMessage, text: agentResponse.finalResult }), nextSpeakerId, 1);
                    }
                } else {
                     const systemMessage: Message = { 
                        id: Date.now().toString() + '-err', 
                        sender: 'system', 
                        text: 'The AI Manager could not decide who should speak next.', 
                        timestamp: new Date().toISOString(),
                        pipeline: managerResponse.pipeline,
                    };
                    onUpdateConversation(conversationId, { messages: [...currentMessages, systemMessage]});
                }
            } else { // Manual Mode
                setLoadingStage({ stage: 'suggesting' });
                const managerResponse = await ManagerService.generateManualSuggestions(text, agents, currentMessages, agentManager, globalApiKey);
                logUsage(0, 'manager', 1);
                setManualSuggestions(managerResponse.result);
            }
        } catch (error) {
            let errorMessageText: string;
            if (error instanceof AIError) {
                errorMessageText = error.userFriendlyMessage;
                 if (error.prompt) {
                     errorMessageText += `\n\n**Failed Prompt:**\n\`\`\`\n${JSON.stringify(error.prompt, null, 2)}\n\`\`\``;
                }
                if (error.partialResponse) {
                    errorMessageText += `\n\n**Partial Response Received:**\n${error.partialResponse}`;
                }
            } else if (error instanceof Error) {
                errorMessageText = getApiErrorMessage(error);
            } else {
                 errorMessageText = 'An unexpected error occurred.';
            }
            onUpdateConversation(conversationId, { messages: [...currentMessages, { id: Date.now().toString() + '-err', sender: 'system', text: errorMessageText, timestamp: new Date().toISOString() }]});
        } finally {
            setLoadingStage({ stage: 'idle' });
            setLastTurnAgentIds(usedAgentIds);
        }
    };

    const handleManualSelection = async (agentId: string) => {
        if (!activeConversation) return;
        const usedAgentIds = new Set<string>([agentId]);
        setLastTurnAgentIds(new Set());

        const conversationId = activeConversation.id;

        setManualSuggestions([]);
        
        const systemInstructionOverride = activeConversation.systemInstructionOverride;
        let currentMessages = activeConversation.messages;

        try {
            const userMessage = [...currentMessages].reverse().find(m => m.sender === 'user');
            const respondingAgent = agents.find(a => a.id === agentId);

            if (respondingAgent && userMessage) {
                setLoadingStage({ stage: 'generating', agentId: respondingAgent.id });
                
                const aiMessageId = `${Date.now()}-ai`;
                const placeholderMessage: Message = { id: aiMessageId, text: '', sender: agentId, timestamp: new Date().toISOString(), isStreaming: true };
                currentMessages = [...currentMessages, placeholderMessage];
                onUpdateConversation(conversationId, { messages: currentMessages});

                const agentResponse = await AgentService.generateResponse(userMessage.text, respondingAgent, activeConversation.messages, userMessage.attachment, systemInstructionOverride, longTermMemory, (chunk) => onAppendToMessageText(conversationId, aiMessageId, chunk), undefined, globalApiKey);

                onFinalizeMessage(conversationId, aiMessageId, {
                    text: agentResponse.finalResult,
                    pipeline: agentResponse.pipeline,
                    isStreaming: false,
                    responseTimeMs: agentResponse.pipeline.find(s => s.stage.startsWith('Model Invocation'))?.durationMs,
                });
                
                logUsage(TokenCounter.estimateTokens({ ...placeholderMessage, text: agentResponse.finalResult }), agentId, 1);
            }
        } catch (error) {
            let errorMessageText: string;
            if (error instanceof AIError) {
                errorMessageText = error.userFriendlyMessage;
                 if (error.prompt) {
                     errorMessageText += `\n\n**Failed Prompt:**\n\`\`\`\n${JSON.stringify(error.prompt, null, 2)}\n\`\`\``;
                }
                if (error.partialResponse) {
                    errorMessageText += `\n\n**Partial Response Received:**\n${error.partialResponse}`;
                }
            } else if (error instanceof Error) {
                errorMessageText = getApiErrorMessage(error);
            } else {
                 errorMessageText = 'An unexpected error occurred.';
            }
            onUpdateConversation(conversationId, { messages: [...currentMessages, { id: Date.now().toString() + '-err', sender: 'system', text: errorMessageText, timestamp: new Date().toISOString() }]});
        } finally {
            setLoadingStage({ stage: 'idle' });
            setLastTurnAgentIds(usedAgentIds);
        }
    };

    const handleSummarizeMessage = async (messageId: string) => {
        if (!activeConversation) return;
        const message = activeConversation.messages.find(m => m.id === messageId);
        if (!message) return;
        
        openActionModal({ title: 'Summarizing...', content: 'Please wait...' });
        try {
            const summary = await MessageActionsService.summarizeMessage(message.text, agentManager, globalApiKey);
            logUsage(0, 'manager', 1);
            openActionModal({ title: 'Summary', content: summary });
        } catch (error) {
            const errorMessage = (error instanceof Error) ? getApiErrorMessage(error) : 'Could not generate summary.';
            openActionModal({ title: 'Error', content: errorMessage });
        }
    };

    const handleRewritePrompt = async (messageId: string) => {
        if (!activeConversation) return;
        const message = activeConversation.messages.find(m => m.id === messageId);
        if (!message || message.sender !== 'user') return;
        
        openActionModal({ title: 'Rewriting...', content: 'Please wait...' });
        try {
            const rewrittenText = await MessageActionsService.rewritePrompt(message.text, agentManager, globalApiKey);
            logUsage(0, 'manager', 1);
            openActionModal({
                title: 'Rewrite Suggestion',
                content: rewrittenText,
                actions: [
                    { label: 'Use & Send', onClick: () => { handleSendMessage(rewrittenText); closeActionModal(); }},
                    { label: 'Cancel', onClick: closeActionModal, isSecondary: true }
                ]
            });
        } catch (error) {
             const errorMessage = (error instanceof Error) ? getApiErrorMessage(error) : 'Could not rewrite prompt.';
             openActionModal({ title: 'Error', content: errorMessage });
        }
    };

    const handleRegenerateResponse = async (aiMessageId: string) => {
        if (!activeConversation) return;
        const usedAgentIds = new Set<string>();
        setLastTurnAgentIds(new Set());
        
        setLoadingStage({ stage: 'generating' });
        const systemInstructionOverride = activeConversation.systemInstructionOverride;

        try {
            const aiMessageIndex = activeConversation.messages.findIndex(m => m.id === aiMessageId);
            if (aiMessageIndex < 1) return;

            const userMessage = activeConversation.messages[aiMessageIndex - 1];
            if (userMessage.sender !== 'user') return; // Ensure the preceding message is from the user
            
            const agent = agents.find(a => a.id === activeConversation.messages[aiMessageIndex].sender);
            if (!agent) return;
            usedAgentIds.add(agent.id);

            setLoadingStage({ stage: 'generating', agentId: agent.id });
            
            // For regeneration, we don't want to stream the response, just get the final result
            const agentResponse = await AgentService.generateResponse(userMessage.text, agent, activeConversation.messages.slice(0, aiMessageIndex), userMessage.attachment, systemInstructionOverride, longTermMemory, () => {}, undefined, globalApiKey);
            
            const newResponse = {
                text: agentResponse.finalResult,
                sender: agent.id,
                timestamp: new Date().toISOString(),
                responseTimeMs: agentResponse.pipeline.find(s => s.stage.startsWith('Model Invocation'))?.durationMs,
                pipeline: agentResponse.pipeline,
            };

            const updatedMessages = activeConversation.messages.map(m => {
                if (m.id === aiMessageId) {
                    const alternatives = m.alternatives ? [...m.alternatives, newResponse] : [newResponse];
                    return { ...m, alternatives, activeAlternativeIndex: alternatives.length - 1 };
                }
                return m;
            });
            onUpdateConversation(activeConversation.id, { messages: updatedMessages });

            const aiMessageTokens = TokenCounter.estimateTokens({ ...newResponse, id: 'temp-regen' });
            logUsage(aiMessageTokens, agent.id, 1);
            
        } catch (error) {
            console.error("Error regenerating response:", error);
            const errorMessage = (error instanceof Error) ? getApiErrorMessage(error) : 'An unexpected error occurred during regeneration.';
            if(activeConversation) {
                const currentMessages = activeConversation.messages;
                onUpdateConversation(activeConversation.id, { messages: [...currentMessages, { id: Date.now().toString() + '-err', sender: 'system', text: `Error: ${errorMessage}`, timestamp: new Date().toISOString() }]});
            }
        } finally {
            setLoadingStage({ stage: 'idle' });
            setLastTurnAgentIds(usedAgentIds);
        }
    };


    return {
        isChatLoading,
        loadingStage,
        manualSuggestions,
        handleSendMessage,
        handleManualSelection,
        handleSummarizeMessage,
        handleRewritePrompt,
        handleRegenerateResponse
    };
};