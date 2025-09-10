
import { Message } from '../../types/index.ts';

const IMAGE_TOKEN_COST = 258; // Based on Gemini API documentation
const CHARS_PER_TOKEN = 4; // A common approximation

export const estimateTokens = (message: Message): number => {
    let tokens = 0;
    if (message.text) {
        tokens += Math.ceil(message.text.length / CHARS_PER_TOKEN);
    }
    if (message.attachment) {
        tokens += IMAGE_TOKEN_COST;
    }
    return tokens;
};