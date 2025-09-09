
export class AIError extends Error {
    public userFriendlyMessage: string;
    public context: string;
    public prompt?: any;
    public partialResponse?: string;

    constructor(message: string, context: string, prompt?: any, partialResponse?: string) {
        super(message);
        this.name = 'AIError';
        this.userFriendlyMessage = getApiErrorMessage(new Error(message));
        this.context = context;
        this.prompt = prompt;
        this.partialResponse = partialResponse;
    }
}

export const getApiErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
            return `The AI model is currently overloaded due to high demand or your API key has exceeded its rate limit. Please check your plan and billing details, or wait a moment and try again. You can change the API key in the settings.`;
        }
        if (errorMessage.includes('api key not valid')) {
            return 'The provided API Key is invalid. Please check your global settings or the specific agent\'s settings.';
        }
        if (errorMessage.includes('candidate was blocked due to safety')) {
            return 'The response was blocked due to safety settings. Please adjust your prompt or the model\'s safety configuration.';
        }
    }
    return `An unexpected error occurred while communicating with the AI. Please check the console for details.`;
}

export const handleAndThrowError = (error: unknown, context: string, prompt?: any, partialResponse?: string): never => {
    console.error(`Error in ${context}:`, error);
    const originalMessage = error instanceof Error ? error.message : String(error);
    throw new AIError(originalMessage, context, prompt, partialResponse);
};