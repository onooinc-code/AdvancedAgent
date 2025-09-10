import { Message } from '../../types/index.ts';

export const buildContext = (messages: Message[]): string => {
    return messages.map(m => `${m.sender}: ${m.text}`).join('\n');
};