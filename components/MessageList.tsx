
import React from 'react';
import { MessageBubble } from './MessageBubble.tsx';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Conversation } from '../types/index.ts';

interface MessageListProps {
    conversation: Conversation | null;
}

export const MessageList: React.FC<MessageListProps> = ({ conversation }) => {
    const { getAgent, messagesEndRef } = useAppContext();
    
    if (!conversation) {
        return (
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-400">Welcome to your AI Assistant</h2>
                    <p className="text-gray-500 mt-2">Create a new chat or select one from the sidebar to get started.</p>
                </div>
            </main>
        );
    }
    
    return (
        <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
                {conversation.messages.map(message => (
                    <MessageBubble 
                        key={message.id} 
                        message={message} 
                        agent={getAgent(message.sender)}
                        featureFlags={conversation.featureFlags}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </main>
    );
};
