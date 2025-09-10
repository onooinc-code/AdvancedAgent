
import { GoogleGenAI } from "@google/genai";

const clients = new Map<string, GoogleGenAI>();

/**
 * Creates and caches GoogleGenAI clients based on the API key.
 * This prevents creating a new instance for every single request
 * while still allowing for multiple API keys to be used in the application.
 * @param apiKey The API key to initialize the client with.
 * @returns A GoogleGenAI instance.
 */
export const getGenAIClient = (apiKey: string): GoogleGenAI => {
    if (clients.has(apiKey)) {
        return clients.get(apiKey)!;
    }
    
    if (!apiKey.trim()) {
        // This is a developer error, should not happen if UI validation is correct
        throw new Error("Attempted to initialize Gemini client with an empty API key.");
    }

    const newClient = new GoogleGenAI({ apiKey });
    clients.set(apiKey, newClient);
    return newClient;
};