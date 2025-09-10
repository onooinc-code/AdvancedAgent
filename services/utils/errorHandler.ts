export class AIError extends Error {
    public context: string;
    public prompt?: any;
    public partialResponse?: string;

    constructor(message: string, context: string, prompt?: any, partialResponse?: string) {
        super(message);
        this.name = 'AIError';
        this.context = context;
        this.prompt = prompt;
        this.partialResponse = partialResponse;
    }

    get userFriendlyMessage(): string {
        return getApiErrorMessage(this);
    }
}

export const getApiErrorMessage = (error: Error | AIError): string => {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
        let contextInfo = '';
        if (error instanceof AIError && error.context) {
            contextInfo = ` The request from **${error.context}** appears to be the one that was rate-limited.`;
        }
        return `**Rate Limit Exceeded**\n\nThe AI model has indicated that you've sent too many requests in a short period.${contextInfo} This often happens in "Dynamic" or "Moderated Chat" modes.\n\n**What to do:**\n1. Please wait about a minute before sending another message.\n2. If this issue persists, check your Google AI Platform plan and billing details.\n3. Consider assigning different API keys to individual agents in the main settings to distribute the request load.`;
    }
    if (errorMessage.includes('api key not valid')) {
        return 'The provided API Key is invalid. Please check your global settings or the specific agent\'s settings.';
    }
    if (errorMessage.includes('candidate was blocked due to safety')) {
        return 'The response was blocked due to safety settings. Please adjust your prompt or the model\'s safety configuration.';
    }
    
    return `An unexpected error occurred while communicating with the AI. Please check the console for details.`;
}

export const handleAndThrowError = (error: unknown, context: string, prompt?: any, partialResponse?: string): never => {
    console.error(`Error in ${context}:`, error);
    const originalMessage = error instanceof Error ? error.message : String(error);
    throw new AIError(originalMessage, context, prompt, partialResponse);
};