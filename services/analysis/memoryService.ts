
import { getGenAIClient } from '../gemini/client.ts';
import { AgentManager, Message, LongTermMemoryData } from '../../types/index.ts';
import { buildContext } from '../utils/contextBuilder.ts';
import { handleAndThrowError } from '../utils/errorHandler.ts';

export const extractKeyInformation = async (
    messages: Message[],
    manager: AgentManager,
    existingMemory: LongTermMemoryData,
    globalApiKey: string,
): Promise<LongTermMemoryData> => {
    
    // Use last 10 messages to keep the context focused and performant
    const conversationContext = buildContext(messages.slice(-10));

    const prompt = `
        Analyze the following conversation snippet. Your goal is to extract or update key facts for a long-term memory JSON object.
        
        The CURRENT memory object is:
        ${JSON.stringify(existingMemory, null, 2)}

        Based on the conversation below, update the memory. You can add new key-value pairs or update existing ones. Keys should be descriptive (snake_case). Focus on important, non-trivial facts like names, goals, or stated preferences.
        
        Conversation Snippet:
        ---
        ${conversationContext}
        ---

        Return ONLY the complete, updated JSON object. Do not add any other text or markdown fences.
    `;
    
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
                systemInstruction: "You are an AI that extracts key information from conversations to build a persistent memory. You must respond with only a valid JSON object.",
                responseMimeType: "application/json",
            }
        });

        const text = response.text.trim();
        // The model can sometimes wrap the JSON in ```json ... ``` despite instructions
        const jsonText = text.replace(/^```json\s*/, '').replace(/```$/, '');
        const updatedMemory = JSON.parse(jsonText);
        return updatedMemory as LongTermMemoryData;

    } catch (error) {
        handleAndThrowError(error, 'extractKeyInformation', prompt);
    }
};