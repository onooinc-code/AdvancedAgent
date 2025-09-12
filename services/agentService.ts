// FIX: Updated to use the new Gemini client factory.
import { getGenAIClient } from './gemini/client.ts';
import { Agent, Message, Attachment } from '../types/index.ts';
// FIX: Switched to new context builder utility.
import { buildContext } from './utils/contextBuilder.ts';

export const generateResponse = async (
    latestText: string, 
    agent: Agent, 
    messages: Message[], 
    attachment?: Attachment,
    systemInstructionOverride?: string,
    globalApiKey?: string // FIX: Added globalApiKey parameter
): Promise<string> => {
    const context = buildContext(messages);
    const systemInstruction = systemInstructionOverride || agent.systemInstruction;

    const contentParts = [];

    if (attachment) {
        contentParts.push({
            inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.base64,
            },
        });
    }

    contentParts.push(
        { text: `Conversation History:\n${context}\n\nUser's latest message: "${latestText}"\n\nYour response:` },
    );

    try {
        // FIX: Added API key handling for the new client.
        const apiKey = agent.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error(`API Key not configured for agent "${agent.name}". Please set a global key or an agent-specific key in the settings.`);
        }
        const ai = getGenAIClient(apiKey);

        const response = await ai.models.generateContent({
            model: agent.model,
            contents: { parts: contentParts },
            config: {
                systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating response for ${agent.name}:`, error);
        return 'I am sorry, but I encountered an error and cannot respond right now.';
    }
};