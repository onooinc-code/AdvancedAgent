import React from 'react';

/**
 * Safely renders content that might be an object if an AI model fails to follow a string schema.
 * If the content is not a string, it is stringified to prevent React from crashing.
 * @param content The content to render.
 * @returns A renderable string.
 */
export const safeRender = (content: any): string => {
    // Check if it's a valid React element first, as this is a specific type of object.
    if (React.isValidElement(content)) {
        console.warn("A React Element was passed for rendering where a string was expected. Returning a placeholder to prevent a crash.", { element: content });
        return '[React Element]';
    }

    // If it's already a string, return it.
    if (typeof content === 'string') {
        return content;
    }
    // If it's a renderable primitive, convert it to a string.
    if (typeof content === 'number' || typeof content === 'boolean' || content === null || typeof content === 'undefined') {
        return String(content);
    }
    // If it's an object or array, stringify it to prevent React from crashing.
    if (typeof content === 'object') {
        try {
            // Log the issue for debugging purposes.
            console.warn("A non-string object was passed for rendering. Stringifying to prevent a crash:", content);
            return JSON.stringify(content, null, 2);
        } catch (e) {
            return '[Unserializable Object]';
        }
    }
    // Final fallback for any other unexpected type.
    return String(content);
};