// FIX: Updated to use the new Gemini client factory.
import { getGenAIClient } from './gemini/client.ts';
import { Agent, Message, AgentManager, ManualSuggestion } from '../types/index.ts';
// FIX: Switched to new context builder utility.
import { buildContext } from './utils/contextBuilder.ts';
import { Type } from "@google/genai";

export const decideNextSpeaker = async (
    latestText: string, 
    agents: Agent[], 
    messages: Message[], 
    manager: AgentManager,
    systemInstructionOverride?: string,
    globalApiKey?: string // FIX: Added globalApiKey parameter
): Promise<string | null> => {
    const context = buildContext(messages);
    const systemInstruction = systemInstructionOverride || manager.systemInstruction;
    
    try {
        // FIX: Added API key handling for the new client.
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured for the Agent Manager. Please set it in the settings.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: `Conversation History:\n${context}\n\nUser's latest message: "${latestText}"\n\nBased on the user's message and history, which agent should respond next?`,
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
        const json = JSON.parse(response.text);
        return json.nextSpeaker || null;
    } catch (error) {
        console.error('Error deciding next speaker:', error);
        return null;
    }
};


export const generateManualSuggestions = async (
    latestText: string,
    agents: Agent[],
    messages: Message[],
    manager: AgentManager,
    globalApiKey?: string // FIX: Added globalApiKey parameter
): Promise<ManualSuggestion[]> => {
    const context = buildContext(messages);
    const agentProfiles = agents.map(a => `- ${a.id}: ${a.name} (${a.systemInstruction})`).join('\n');

    try {
        // FIX: Added API key handling for the new client.
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured for the Agent Manager. Please set it in the settings.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: `Conversation History:\n${context}\n\nUser's latest message: "${latestText}"\n\nAgent Profiles:\n${agentProfiles}\n\nSuggest 3 agents who could respond to the user's message and provide a brief reason for each.`,
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
        
        const json = JSON.parse(response.text);
        return json.suggestions || [];
    } catch (error) {
        console.error('Error generating manual suggestions:', error);
        return [];
    }
};