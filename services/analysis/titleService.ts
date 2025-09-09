
import { getGenAIClient } from '../gemini/client.ts';
import { Message, AgentManager } from '../../types/index.ts';
import { buildContext } from '../utils/contextBuilder.ts';
import { handleAndThrowError } from '../utils/errorHandler.ts';

export const generateConversationTitle = async (messages: Message[], manager: AgentManager, globalApiKey: string): Promise<string> => {
    if (messages.length === 0) return "New Chat";
    
    const fullContext = buildContext(messages);
    const context = fullContext.substring(0, 4000); 
    const prompt = `Read the following conversation and generate a short, concise title (4 words maximum).\n\nConversation:\n${context}`;

    try {
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured. Please set a global key in the settings to enable title generation.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: prompt,
            config: {
                systemInstruction: "You generate short, relevant titles for conversations.",
            }
        });
        
        let title = response.text.trim();
        if (title.startsWith('"') && title.endsWith('"')) {
            title = title.substring(1, title.length - 1);
        }
        return title || "Untitled Chat";
    } catch (error) {
        handleAndThrowError(error, 'generateConversationTitle', prompt);
    }
};