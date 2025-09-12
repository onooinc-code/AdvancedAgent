// FIX: Updated to use the new Gemini client factory.
import { getGenAIClient } from './gemini/client.ts';
// FIX: Corrected import path for types.
import { Message, AgentManager } from '../types/index.ts';
// FIX: Replaced local buildContext with a shared utility.
import { buildContext } from './utils/contextBuilder.ts';

export const generateConversationTitle = async (messages: Message[], manager: AgentManager, globalApiKey: string): Promise<string> => {
    if (messages.length === 0) return "New Chat";
    
    // FIX: Use shared context builder and truncate here.
    const context = buildContext(messages).substring(0, 4000); // Truncate for performance
    try {
        // FIX: Added API key handling for the new client.
        const apiKey = manager.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured. Please set a global key in the settings to enable title generation.");
        }
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
            model: manager.model,
            contents: `Read the following conversation and generate a short, concise title (4 words maximum).\n\nConversation:\n${context}`,
            config: {
                systemInstruction: "You generate short, relevant titles for conversations.",
            }
        });
        
        // Clean up the title, remove quotes if any
        let title = response.text.trim();
        if (title.startsWith('"') && title.endsWith('"')) {
            title = title.substring(1, title.length - 1);
        }
        return title || "Untitled Chat";
    } catch (error) {
        console.error("Error generating title:", error);
        return "Chat";
    }
};