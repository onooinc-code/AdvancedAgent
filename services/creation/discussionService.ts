
import { getGenAIClient } from '../gemini/client.ts';
import { Agent, Message } from '../../types/index.ts';
import { Type } from "@google/genai";
import { handleAndThrowError } from '../utils/errorHandler.ts';

export const generateDiscussionRulesAndOrder = async (
    agents: Agent[],
    messages: Message[],
    globalApiKey: string,
): Promise<{ rules: string; }> => {
    
    const agentProfiles = agents.map(a => 
        `- ID: ${a.id}\n  Name: ${a.name}\n  Specialization: ${a.job}\n  Role: ${a.role}`
    ).join('\n\n');

    const recentHistory = messages
        .slice(-6) // Get last 6 messages for topic context
        .map(m => `${m.sender === 'user' ? 'User' : `Agent(${m.sender})`}: ${m.text}`)
        .join('\n');

    const prompt = `
        Based on the following AI agent profiles and the recent conversation history, generate a set of "Conversation Rules" for a productive discussion.

        **Agent Profiles:**
        ${agentProfiles}

        **Recent Conversation History (to infer the topic):**
        ${recentHistory || "(No history yet, assume a new topic)"}

        **Your Task:**
        Write a short system prompt that will guide the entire discussion. It should instruct the agents on how to interact based on their roles.

        Return a valid JSON object.
    `;

    try {
        const apiKey = agents[0]?.apiKey || globalApiKey;
        if (!apiKey) {
            throw new Error("API Key not configured. Please set a global key or a key for the first agent.");
        }
        const ai = getGenAIClient(apiKey);

        const response = await ai.models.generateContent({
            model: agents[0]?.model || 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert at orchestrating conversations between multiple AI agents.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        rules: { type: Type.STRING },
                    }
                }
            }
        });

        const json = JSON.parse(response.text);
        if (!json.rules) {
            throw new Error("AI response was missing required fields.");
        }
        return json;
    } catch (error) {
        handleAndThrowError(error, 'generateDiscussionRulesAndOrder', prompt);
    }
};