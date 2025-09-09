
import { getGenAIClient } from '../gemini/client.ts';
import { Message, AgentManager } from '../../types/index.ts';
import { Type } from "@google/genai";
import { buildContext } from '../utils/contextBuilder.ts';
import { handleAndThrowError } from '../utils/errorHandler.ts';

export const summarizeMessageChunk = async (messages: Message[], manager: AgentManager, globalApiKey: string): Promise<string> => {
    const context = buildContext(messages);
    const prompt = `Summarize the following part of a conversation in a single, concise sentence:\n\n${context}`;
    try {
        const apiKey = manager.apiKey || globalApiKey;
         if (!apiKey) {
            return "Could not summarize: API Key is not configured.";
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: prompt,
            config: {
                systemInstruction: "You are a summarization assistant.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing chunk:", error);
        // For chunks, we prefer to return a soft error message rather than failing the whole history view.
        return "Could not summarize this section due to an API error.";
    }
};

export const generateOverallSummaryAndTopics = async (messages: Message[], manager: AgentManager, globalApiKey: string): Promise<{ overallSummary: string, topics: string[] }> => {
    const context = buildContext(messages);
    const prompt = `Analyze the following conversation and provide an overall summary and a list of the main topics discussed.\n\n${context}`;
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
        handleAndThrowError(error, 'generateOverallSummaryAndTopics', prompt);
    }
};