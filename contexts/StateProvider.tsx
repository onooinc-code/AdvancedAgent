import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { Agent, AgentManager, ConversationMode, Attachment, ManualSuggestion, HistoryView, Conversation, PipelineStep, UsageMetrics, Message, LongTermMemoryData, BubbleSettings } from '../types/index.ts';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';
import { DEFAULT_AGENTS, DEFAULT_AGENT_MANAGER } from '../constants.ts';
import { useConversationManager } from './hooks/useConversationManager.ts';
import { useChatHandler, LoadingStage } from './hooks/useChatHandler.ts';
import { useHistoryHandler } from './hooks/useHistoryHandler.ts';
import { useModalManager } from './hooks/useModalManager.ts';
import { useUsageTracker } from './hooks/useUsageTracker.ts';
import { useMemoryManager } from './hooks/useMemoryManager.ts';
import * as MemoryService from '../services/analysis/memoryService.ts';
import { ActionModalState } from './hooks/useModalManager.ts';

interface AppState {
    agents: Agent[];
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
    handleReplaceAgents: (newAgents: Agent[]) => void;
    agentManager: AgentManager;
    setAgentManager: React.Dispatch<React.SetStateAction<AgentManager>>;
    
    conversations: Conversation[];
    activeConversationId: string | null;
    activeConversation: Conversation | null;

    conversationMode: ConversationMode;
    setConversationMode: React.Dispatch<React.SetStateAction<ConversationMode>>;
    isLoading: boolean;
    loadingStage: LoadingStage;
    isSettingsOpen: boolean;
    setIsSettingsOpen: (isOpen: boolean) => void;
    isHistoryOpen: boolean;
    setIsHistoryOpen: (isOpen: boolean) => void;
    manualSuggestions: ManualSuggestion[];
    historyView: HistoryView | null;
    sendOnEnter: boolean;
    setSendOnEnter: React.Dispatch<React.SetStateAction<boolean>>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    
    handleSendMessage: (text: string, attachment?: Attachment) => Promise<void>;
    handleManualSelection: (agentId: string) => Promise<void>;
    handleShowHistory: () => Promise<void>;
    getAgent: (id: string) => Agent | undefined;

    // Conversation management functions
    handleNewConversation: () => void;
    handleDeleteConversation: (conversationId: string) => void;
    handleSelectConversation: (conversationId: string) => void;
    handleUpdateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
    handleUpdateConversationTitle: (conversationId: string, title: string) => void;
    handleGenerateTitle: (conversationId: string) => Promise<void>;
    handleExportConversations: () => void;
    handleImportConversations: (file: File) => void;
    
    // Per-conversation settings modal
    isConversationSettingsOpen: boolean;
    setIsConversationSettingsOpen: (isOpen: boolean) => void;
    
    // HTML Preview Modal
    isHtmlPreviewOpen: boolean;
    htmlPreviewContent: string;
    handleShowHtmlPreview: (html: string) => void;
    handleCloseHtmlPreview: () => void;

    // Message actions
    handleToggleMessageBookmark: (messageId: string) => void;
    handleDeleteMessage: (messageId: string) => void;
    handleToggleMessageEdit: (messageId: string) => void;
    handleUpdateMessageText: (messageId: string, newText: string) => void;
    handleAppendToMessageText: (conversationId: string, messageId: string, textChunk: string) => void;
    handleFinalizeMessage: (conversationId: string, messageId: string, finalMessageData: Partial<Message>) => void;
    
    // AI Message Actions
    actionModalState: ActionModalState;
    closeActionModal: () => void;
    handleSummarizeMessage: (messageId: string) => Promise<void>;
    handleRewritePrompt: (messageId: string) => Promise<void>;
    handleRegenerateResponse: (aiMessageId: string) => Promise<void>;
    handleChangeAlternativeResponse: (messageId: string, direction: 'next' | 'prev') => void;

    // Inspector Modal
    isInspectorOpen: boolean;
    inspectorData: PipelineStep[] | null;
    openInspectorModal: (pipeline: PipelineStep[]) => void;
    closeInspectorModal: () => void;

    // Prompt Inspector Modal
    isPromptInspectorOpen: boolean;
    promptInspectorData: Message | null;
    openPromptInspectorModal: (message: Message) => void;
    closePromptInspectorModal: () => void;

    // Usage Metrics
    usageMetrics: UsageMetrics;
    logUsage: (tokens: number, agentId?: string, requestCount?: number) => void;

    // Agent Stats Modal
    isAgentStatsOpen: boolean;
    setIsAgentStatsOpen: (isOpen: boolean) => void;

    // Team Generator Modal
    isTeamGeneratorOpen: boolean;
    setIsTeamGeneratorOpen: (isOpen: boolean) => void;

    // API Usage Modal
    isApiUsageOpen: boolean;
    setIsApiUsageOpen: (isOpen: boolean) => void;

    // Long-Term Memory
    longTermMemory: LongTermMemoryData;
    setLongTermMemory: React.Dispatch<React.SetStateAction<LongTermMemoryData>>;
    clearMemory: () => void;
    handleExtractAndUpdateMemory: () => Promise<void>;

    // Global API Key
    globalApiKey: string;
    setGlobalApiKey: React.Dispatch<React.SetStateAction<string>>;

    // Bubble Settings
    agentBubbleSettings: BubbleSettings;
    setAgentBubbleSettings: React.Dispatch<React.SetStateAction<BubbleSettings>>;
    userBubbleSettings: BubbleSettings;
    setUserBubbleSettings: React.Dispatch<React.SetStateAction<BubbleSettings>>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Core state and settings from localStorage
    const [agents, setAgents] = useLocalStorage<Agent[]>('agents', DEFAULT_AGENTS);
    const [agentManager, setAgentManager] = useLocalStorage<AgentManager>('agent-manager', DEFAULT_AGENT_MANAGER);
    const [conversationMode, setConversationMode] = useLocalStorage<ConversationMode>('conversation-mode', 'Dynamic');
    const [sendOnEnter, setSendOnEnter] = useLocalStorage<boolean>('send-on-enter', true);
    const [globalApiKey, setGlobalApiKey] = useLocalStorage<string>('global-api-key', '');
    const [agentBubbleSettings, setAgentBubbleSettings] = useLocalStorage<BubbleSettings>('agent-bubble-settings', { alignment: 'left', scale: 1, textDirection: 'ltr', fontSize: 1 });
    const [userBubbleSettings, setUserBubbleSettings] = useLocalStorage<BubbleSettings>('user-bubble-settings', { alignment: 'right', scale: 1, textDirection: 'ltr', fontSize: 1 });
    
    // 2. Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isExtractingMemory, setIsExtractingMemory] = useState(false);

    // 3. Custom Hooks for logic domains
    const modalManager = useModalManager();
    const conversationManager = useConversationManager();
    const historyHandler = useHistoryHandler();
    const usageTracker = useUsageTracker();
    const memoryManager = useMemoryManager();
    const chatHandler = useChatHandler({
        agents,
        agentManager,
        globalApiKey,
        activeConversation: conversationManager.activeConversation,
        conversationMode,
        longTermMemory: memoryManager.longTermMemory,
        onUpdateConversation: conversationManager.handleUpdateConversation,
        onAppendToMessageText: conversationManager.handleAppendToMessageText,
        onFinalizeMessage: conversationManager.handleFinalizeMessage,
        openActionModal: modalManager.openActionModal,
        closeActionModal: modalManager.closeActionModal,
        logUsage: usageTracker.logUsage,
    });
    
    // 4. Combined loading state for UI components
    const isLoading = chatHandler.isChatLoading || historyHandler.isGeneratingHistory || isExtractingMemory || conversationManager.isGeneratingTitle;

    // 5. Callback functions that bridge hooks or components
    const getAgent = useCallback((id: string) => {
        return agents.find(a => a.id === id);
    }, [agents]);

    const handleShowHistory = async () => {
        if (conversationManager.activeConversation) {
            modalManager.setIsHistoryOpen(true);
            await historyHandler.handleShowHistory(conversationManager.activeConversation, agentManager, globalApiKey);
        }
    };

    const handleGenerateTitle = async (conversationId: string) => {
        await conversationManager.handleGenerateTitle(conversationId, agentManager, globalApiKey);
    }

    const handleReplaceAgents = (newAgents: Agent[]) => {
        setAgents(newAgents);
        modalManager.setIsTeamGeneratorOpen(false);
    };

    const handleExtractAndUpdateMemory = async () => {
        if (!conversationManager.activeConversation || isLoading) return;

        setIsExtractingMemory(true);
        try {
            const newFacts = await MemoryService.extractKeyInformation(
                conversationManager.activeConversation.messages,
                agentManager,
                memoryManager.longTermMemory,
                globalApiKey
            );
            memoryManager.setLongTermMemory(newFacts);
            alert('Memory updated successfully!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update memory from conversation.';
            console.error('Failed to update memory', error);
            alert(message);
        } finally {
            setIsExtractingMemory(false);
        }
    };
    
    // 6. Assemble the context value, ensuring the AppState interface is matched
    const value: AppState = {
        // Core state
        agents,
        setAgents,
        handleReplaceAgents,
        agentManager,
        setAgentManager,
        conversationMode,
        setConversationMode,
        sendOnEnter,
        setSendOnEnter,
        messagesEndRef,
        getAgent,
        globalApiKey,
        setGlobalApiKey,
        
        // From useConversationManager
        conversations: conversationManager.conversations,
        activeConversationId: conversationManager.activeConversationId,
        activeConversation: conversationManager.activeConversation,
        handleNewConversation: conversationManager.handleNewConversation,
        handleDeleteConversation: conversationManager.handleDeleteConversation,
        handleSelectConversation: conversationManager.handleSelectConversation,
        handleUpdateConversation: conversationManager.handleUpdateConversation,
        handleUpdateConversationTitle: conversationManager.handleUpdateConversationTitle,
        handleGenerateTitle,
        handleExportConversations: conversationManager.handleExportConversations,
        handleImportConversations: conversationManager.handleImportConversations,

        // From useChatHandler & combined loading state
        isLoading,
        loadingStage: chatHandler.loadingStage,
        manualSuggestions: chatHandler.manualSuggestions,
        handleSendMessage: chatHandler.handleSendMessage,
        handleManualSelection: chatHandler.handleManualSelection,

        // From useHistoryHandler and its wrapper
        historyView: historyHandler.historyView,
        handleShowHistory,

        // From useModalManager
        isSettingsOpen: modalManager.isSettingsOpen,
        setIsSettingsOpen: modalManager.setIsSettingsOpen,
        isHistoryOpen: modalManager.isHistoryOpen,
        setIsHistoryOpen: modalManager.setIsHistoryOpen,
        isConversationSettingsOpen: modalManager.isConversationSettingsOpen,
        setIsConversationSettingsOpen: modalManager.setIsConversationSettingsOpen,
        isHtmlPreviewOpen: modalManager.isHtmlPreviewOpen,
        htmlPreviewContent: modalManager.htmlPreviewContent,
        handleShowHtmlPreview: modalManager.handleShowHtmlPreview,
        handleCloseHtmlPreview: modalManager.handleCloseHtmlPreview,
        isAgentStatsOpen: modalManager.isAgentStatsOpen,
        setIsAgentStatsOpen: modalManager.setIsAgentStatsOpen,
        isTeamGeneratorOpen: modalManager.isTeamGeneratorOpen,
        setIsTeamGeneratorOpen: modalManager.setIsTeamGeneratorOpen,
        isApiUsageOpen: modalManager.isApiUsageOpen,
        setIsApiUsageOpen: modalManager.setIsApiUsageOpen,

        // Message actions from useConversationManager
        handleToggleMessageBookmark: conversationManager.handleToggleMessageBookmark,
        handleDeleteMessage: conversationManager.handleDeleteMessage,
        handleToggleMessageEdit: conversationManager.handleToggleMessageEdit,
        handleUpdateMessageText: conversationManager.handleUpdateMessageText,
        handleAppendToMessageText: conversationManager.handleAppendToMessageText,
        handleFinalizeMessage: conversationManager.handleFinalizeMessage,
        
        // AI Message Actions
        actionModalState: modalManager.actionModalState,
        closeActionModal: modalManager.closeActionModal,
        handleSummarizeMessage: chatHandler.handleSummarizeMessage,
        handleRewritePrompt: chatHandler.handleRewritePrompt,
        handleRegenerateResponse: chatHandler.handleRegenerateResponse,
        handleChangeAlternativeResponse: conversationManager.handleChangeAlternativeResponse,

        // Inspector Modal
        isInspectorOpen: modalManager.isInspectorOpen,
        inspectorData: modalManager.inspectorData,
        openInspectorModal: modalManager.openInspectorModal,
        closeInspectorModal: modalManager.closeInspectorModal,

        // Prompt Inspector Modal
        isPromptInspectorOpen: modalManager.isPromptInspectorOpen,
        promptInspectorData: modalManager.promptInspectorData,
        openPromptInspectorModal: modalManager.openPromptInspectorModal,
        closePromptInspectorModal: modalManager.closePromptInspectorModal,

        // Usage Metrics
        usageMetrics: usageTracker.usageMetrics,
        logUsage: usageTracker.logUsage,
        
        // Long-Term Memory
        longTermMemory: memoryManager.longTermMemory,
        setLongTermMemory: memoryManager.setLongTermMemory,
        clearMemory: memoryManager.clearMemory,
        handleExtractAndUpdateMemory,

        // Bubble Settings
        agentBubbleSettings,
        setAgentBubbleSettings,
        userBubbleSettings,
        setUserBubbleSettings,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppState => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
