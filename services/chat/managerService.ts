
import { getGenAIClient } from '../gemini/client.ts';
import { Agent, Message, AgentManager, ManualSuggestion, PipelineStep, PlanStep } from '../../types/index.ts';
import { buildContext } from '../utils/contextBuilder.ts';
import { Type } from "@google/genai";
import { handleAndThrowError } from '../utils/errorHandler.ts';

export interface ModerationResult {
    critique: string | null;
    decision: 'speak' | 'wait_for_user';
    nextSpeakerAgentId: string | null;
    taskForNextSpeaker: string | null;
    rationale: string;
}

export interface DynamicPlanResult {
    plan: PlanStep[];
    planRationale: string;
}

export const decideNextSpeaker = async (
    latestText: string, 
    agents: Agent[], 
    messages: Message[], 
    manager: AgentManager,
    systemInstructionOverride: string | undefined,
    globalApiKey: string,
): Promise<{ result: string | null; pipeline: PipelineStep[] }> => {
    const pipeline: PipelineStep[] = [];
    const startTime = performance.now();

    const context = buildContext(messages);
    const systemInstruction = systemInstructionOverride || manager.systemInstruction;
    const prompt = `Conversation History:\n${context}\n\nUser's latest message: "${latestText}"\n\nBased on the user's message and history, which agent should respond next?`;
    
    pipeline.push({
        stage: 'Context Assembly',
        input: {
            latestText,
            messageCount: messages.length,
            managerSystemInstruction: systemInstruction,
        },
        output: prompt,
    });
    
    try {
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured for the Agent Manager. Please set it in the settings.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        nextSpeaker: { type: Type.STRING }
                    }
                }
            }
        });

        const modelDuration = performance.now() - startTime;
        let json;
        let nextSpeaker = null;
        try {
            json = JSON.parse(response.text);
            nextSpeaker = json.nextSpeaker || null;
        } catch (e) {
            json = { error: "Failed to parse JSON", rawText: response.text };
        }

        pipeline.push({
            stage: 'Model Invocation: decideNextSpeaker',
            input: prompt,
            output: json,
            durationMs: Math.round(modelDuration),
        });

        return { result: nextSpeaker, pipeline };
    } catch (error) {
        handleAndThrowError(error, 'decideNextSpeaker', prompt);
    }
};


export const generateManualSuggestions = async (
    latestText: string,
    agents: Agent[],
    messages: Message[],
    manager: AgentManager,
    globalApiKey: string,
): Promise<{ result: ManualSuggestion[], pipeline: PipelineStep[] }> => {
    const pipeline: PipelineStep[] = [];
    const startTime = performance.now();

    const context = buildContext(messages);
    const agentProfiles = agents.map(a => `- ${a.id}: ${a.name} (${a.systemInstruction})`).join('\n');
    const prompt = `Conversation History:\n${context}\n\nUser's latest message: "${latestText}"\n\nAgent Profiles:\n${agentProfiles}\n\nSuggest 3 agents who could respond to the user's message and provide a brief reason for each.`;

    pipeline.push({
        stage: 'Context Assembly',
        input: {
            latestText,
            messageCount: messages.length,
            agentProfiles,
        },
        output: prompt,
    });

    try {
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured for the Agent Manager. Please set it in the settings.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: prompt,
            config: {
                systemInstruction: "You are an AI assistant that suggests which agent should speak next in a multi-agent chat.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    agentId: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const modelDuration = performance.now() - startTime;
        let json;
        let suggestions: ManualSuggestion[] = [];
        try {
            json = JSON.parse(response.text);
            suggestions = json.suggestions || [];
        } catch (e) {
            json = { error: "Failed to parse JSON", rawText: response.text };
        }

        pipeline.push({
            stage: 'Model Invocation: generateManualSuggestions',
            input: prompt,
            output: json,
            durationMs: Math.round(modelDuration),
        });

        return { result: suggestions, pipeline };
    } catch (error) {
        handleAndThrowError(error, 'generateManualSuggestions', prompt);
    }
};

export const generateDynamicPlan = async (
    latestText: string,
    agents: Agent[],
    messages: Message[],
    manager: AgentManager,
    globalApiKey: string,
): Promise<{ result: DynamicPlanResult, pipeline: PipelineStep[] }> => {
    const pipeline: PipelineStep[] = [];
    const startTime = performance.now();
    const defaultResult = { plan: [], planRationale: '' };

    const context = buildContext(messages);
    const agentProfiles = agents.map(a => `- ${a.id}: ${a.name} (${a.job}) - ${a.role}`).join('\n');
    const prompt = `
        You are an expert AI Manager. Your job is to create a step-by-step plan to address the user's request using a team of AI agents.

        **Your Thinking Process:**
        1.  **Analyze the User's Request:** Deconstruct the user's latest message to understand their core goal.
        2.  **Consult Agent Profiles:** Review the available agents and their specializations to see who can help.
        3.  **Formulate a Plan:** Create a sequence of logical steps. Even simple requests should have a one-step plan.
        4.  **Assign Agents:** Assign the best agent for each task in the plan.
        5.  **Provide Rationale:** Write a brief, high-level rationale explaining your overall strategy for the plan.
        
        **Crucial Rule on Self-Reference:**
        If the user's request seems to be about you or your own functioning (e.g., "you are failing", "create a better plan", "you couldn't make a plan"), do not treat it as a meta-command to stop. Instead, interpret it as a task to be analyzed and planned like any other. For example, if the user says "You aren't making good plans", a valid plan would be to assign an agent to analyze the previous plans and suggest improvements.

        **Available Agents:**
        ${agentProfiles}

        **Conversation History:**
        ${context}

        **User's latest message:** "${latestText}"

        **Your Task:**
        You MUST formulate a plan. Create a sequence of tasks for the agents to follow. Your response MUST be a valid JSON object.
        - **planRationale**: A brief, high-level summary explaining your strategic thinking behind the plan.
        - **plan**: An array of steps for the agents to follow.
        - If the request is simple, create a one-step plan.
        - **If the request is genuinely unclear, nonsensical, or a simple greeting (like "hello"), your plan should be a single step to have an appropriate agent (like the Empathetic Counselor, agent-3) ask the user for clarification or respond to the greeting.** Do NOT return an empty plan for these cases.

        **Example of a good plan for a complex request:**
        {
          "planRationale": "The request requires two stages: first, data analysis to extract facts, and second, creative writing to present those facts in a compelling way. I will assign the Technical Analyst for the first step and the Creative Writer for the second.",
          "plan": [
            {
              "agentId": "agent-2",
              "task": "Analyze the provided data to identify key trends.",
              "rationale": "The Technical Analyst is best suited to find patterns in data first."
            },
            {
              "agentId": "agent-1",
              "task": "Write a compelling summary of the identified trends for a business audience.",
              "rationale": "The Creative Writer can then turn the raw analysis into an engaging narrative."
            }
          ]
        }
    `;
    
    pipeline.push({
        stage: 'Plan Generation Context Assembly',
        input: { latestText, agentCount: agents.length, messageCount: messages.length },
        output: prompt,
    });

    try {
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured for the Agent Manager. Please set it in the settings.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert AI project manager. Your goal is to create a sequence of tasks for other AI agents to complete based on a user's request. Respond with only a valid JSON object.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        planRationale: { type: Type.STRING },
                        plan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    agentId: { type: Type.STRING },
                                    task: { type: Type.STRING },
                                    rationale: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const modelDuration = performance.now() - startTime;
        let json;
        let planResult: DynamicPlanResult = defaultResult;
        try {
            json = JSON.parse(response.text);
            planResult = {
                plan: json.plan || [],
                planRationale: json.planRationale || '',
            };
        } catch (e) {
            json = { error: "Failed to parse JSON", rawText: response.text };
        }

        pipeline.push({
            stage: 'Model Invocation: generateDynamicPlan',
            input: prompt,
            output: json,
            durationMs: Math.round(modelDuration),
        });

        return { result: planResult, pipeline };
    } catch (error) {
        handleAndThrowError(error, 'generateDynamicPlan', prompt);
    }
};


export const moderateTurn = async (
    agents: Agent[],
    messages: Message[],
    manager: AgentManager,
    rules: string,
    globalApiKey: string,
): Promise<{ result: ModerationResult | null; pipeline: PipelineStep[] }> => {
    const pipeline: PipelineStep[] = [];
    const startTime = performance.now();
    const context = buildContext(messages);
    const agentProfiles = agents.map(a => `- ${a.id}: ${a.name} (${a.job})`).join('\n');
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromAgent = lastMessage && lastMessage.sender !== 'user' && lastMessage.sender !== 'system';

    const prompt = `
        You are an expert AI conversation moderator in a meeting with a user and a team of AI agents. Your job is to manage the conversation flow dynamically.

        **Your Thinking Process:**
        1.  **Analyze the Last Message:** Who said it? What was the intent?
        2.  **Critique (If Applicable):** If the last message was from an AI, evaluate it. Did it follow the conversation rules? Did it address the user's request? If not, formulate a brief, constructive critique.
        3.  **Decide the Next Action:** Based on the conversation, decide what should happen next. Should another agent speak to continue the progress, or is it time to wait for the user's input?
        4.  **Assign Task:** If an agent should speak, formulate a clear, one-sentence task for them.
        
        **Available Agents:**
        ${agentProfiles}

        **Conversation Rules:**
        ${rules}

        **Full Conversation History:**
        ${context}

        **Your Task:**
        Analyze the state of the conversation and decide the next step. Your response MUST be a valid JSON object.
        - **"critique"**: If the last message was from an agent, provide a critique IF AND ONLY IF they violated the rules or failed to address the task. Otherwise, this MUST be null.
        - **"decision"**: Your final decision. Must be either "speak" (if an agent should talk next) or "wait_for_user" (if the conversation is at a good stopping point).
        - **"nextSpeakerAgentId"**: The ID of the agent who should speak next. MUST be null if the decision is "wait_for_user".
        - **"taskForNextSpeaker"**: A clear, concise task for the next speaker. MUST be null if the decision is "wait_for_user".
        - **"rationale"**: A brief explanation for your decision.
    `;

    pipeline.push({
        stage: 'Moderation Context Assembly',
        input: { rule: rules, agentCount: agents.length, messageCount: messages.length, isLastMessageFromAgent },
        output: prompt,
    });
    
    try {
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured for the Agent Manager. Please set it in the settings.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: prompt,
            config: {
                systemInstruction: "You are an AI conversation moderator. Your response must be a single, valid JSON object following the specified schema.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        critique: { type: Type.STRING, nullable: true },
                        decision: { type: Type.STRING, enum: ['speak', 'wait_for_user'] },
                        nextSpeakerAgentId: { type: Type.STRING, nullable: true },
                        taskForNextSpeaker: { type: Type.STRING, nullable: true },
                        rationale: { type: Type.STRING },
                    },
                    required: ["critique", "decision", "nextSpeakerAgentId", "taskForNextSpeaker", "rationale"]
                }
            }
        });

        const modelDuration = performance.now() - startTime;
        let json;
        try {
            json = JSON.parse(response.text);
             // Basic validation
            if (!json.decision || !json.rationale) {
                throw new Error("Missing required fields in moderation response.");
            }
        } catch (e) {
            console.error("Failed to parse or validate moderation JSON:", e, "Raw Text:", response.text);
            json = { error: "Failed to parse JSON", rawText: response.text };
            return { result: null, pipeline }; // Return null on parsing failure
        }
        
        pipeline.push({
            stage: 'Model Invocation: moderateTurn',
            input: prompt,
            output: json,
            durationMs: Math.round(modelDuration),
        });

        return { result: json as ModerationResult, pipeline };

    } catch (error) {
        handleAndThrowError(error, 'moderateTurn', prompt);
    }
};