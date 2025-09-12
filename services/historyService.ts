// FIX: Updated to use the new Gemini client factory.
import { getGenAIClient } from './gemini/client.ts';
// FIX: Corrected import path for types.
import { Message, AgentManager } from '../types/index.ts';
import { Type } from "@google/genai";
// FIX: Replaced local buildContext with a shared utility.
import { buildContext } from './utils/contextBuilder.ts';

export const summarizeMessageChunk = async (messages: Message[], manager: AgentManager, globalApiKey: string): Promise<string> => {
    const context = buildContext(messages);
    try {
        // FIX: Added API key handling for the new client.
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            return "Could not summarize: API Key is not configured.";
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: `Summarize the following part of a conversation in a single, concise sentence:\n\n${context}`,
            config: {
                systemInstruction: "You are a summarization assistant.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing chunk:", error);
        return "Could not summarize this section.";
    }
};

export const generateOverallSummaryAndTopics = async (messages: Message[], manager: AgentManager, globalApiKey: string): Promise<{ overallSummary: string, topics: string[] }> => {
    const context = buildContext(messages);
    try {
        // FIX: Added API key handling for the new client.
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured for the Agent Manager. Please set it in the settings.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: `Analyze the following conversation and provide an overall summary and a list of the main topics discussed.\n\n${context}`,
            config: {
                systemInstruction: "You are a summarization assistant. Your response must be a valid JSON object.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallSummary: { type: Type.STRING },
                        topics: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return {
            overallSummary: json.overallSummary || "No summary available.",
            topics: json.topics || [],
        };
    } catch (error) {
        console.error("Error generating overall summary:", error);
        return {
            overallSummary: "Could not generate a summary.",
            topics: [],
        };
    }
};