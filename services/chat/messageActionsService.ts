
import { getGenAIClient } from '../gemini/client.ts';
import { AgentManager } from '../../types/index.ts';
import { handleAndThrowError } from '../utils/errorHandler.ts';

export const summarizeMessage = async (text: string, manager: AgentManager, globalApiKey: string): Promise<string> => {
    const prompt = `Summarize the following text in one or two concise sentences:\n\n---\n${text}\n---`;
    try {
        const apiKey = manager.apiKey || globalApiKey;
         if (!apiKey) {
            throw new Error("API Key not configured. Please set a global key in the settings to enable summarization.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: prompt,
            config: {
                systemInstruction: "You are a summarization assistant.",
            }
        });
        return response.text.trim();
    } catch (error) {
        handleAndThrowError(error, 'summarizeMessage', prompt);
    }
};

export const rewritePrompt = async (prompt: string, manager: AgentManager, globalApiKey: string): Promise<string> => {
    const fullPrompt = `Rewrite the following user prompt to be clearer, more detailed, and more effective for an AI assistant. Return only the rewritten prompt.\n\n---\n${prompt}\n---`;
     try {
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured. Please set a global key in the settings to enable rewriting.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: fullPrompt,
            config: {
                systemInstruction: "You are an expert prompt engineer. You rewrite user prompts to be optimal for large language models.",
            }
        });
        let rewritten = response.text.trim();
        // Remove potential quotes around the response
        if (rewritten.startsWith('"') && rewritten.endsWith('"')) {
            rewritten = rewritten.substring(1, rewritten.length - 1);
        }
        return rewritten;
    } catch (error) {
        handleAndThrowError(error, 'rewritePrompt', fullPrompt);
    }
}