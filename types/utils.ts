
import { Conversation } from './conversation';

// A basic check to see if an object resembles a Conversation.
// This can be made more robust if needed.
const isConversation = (obj: any): obj is Conversation => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        Array.isArray(obj.messages)
    );
};

// Type guard to check if the data is an array of Conversation objects.
export const isConversationArray = (data: any): data is Conversation[] => {
    return Array.isArray(data) && data.every(isConversation);
};