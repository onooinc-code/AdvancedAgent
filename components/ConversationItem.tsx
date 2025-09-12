import React from 'react';
import { Conversation } from '../types/index.ts';
import { TrashIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isActive, onSelect, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${safeRender(conversation.title)}"?`)) {
            onDelete(conversation.id);
        }
    };

    return (
        <div 
            onClick={() => onSelect(conversation.id)}
            className={`flex justify-between items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 border-l-4 group ${
                isActive 
                ? 'bg-indigo-600/30 border-indigo-500 neon-glow-indigo' 
                : 'border-transparent hover:bg-white/10'
            }`}
            role="button"
            aria-pressed={isActive}
        >
            <p className="truncate text-sm font-medium">{safeRender(conversation.title)}</p>
            <button
                onClick={handleDelete}
                className={`p-1 rounded-full text-gray-400 hover:bg-red-500/50 hover:text-white flex-shrink-0 transition-all duration-200 opacity-0 group-hover:opacity-100`}
                aria-label={`Delete ${safeRender(conversation.title)}`}
                title={`Delete conversation: "${safeRender(conversation.title)}"`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};