
import React, { useState, useMemo } from 'react';
import { ConversationItem } from './ConversationItem.tsx';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { PlusIcon, SearchIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

interface ConversationListProps {
    isOpen: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({ isOpen }) => {
    const { 
        conversations, 
        activeConversationId,
        handleNewConversation,
        handleDeleteConversation,
        handleSelectConversation
    } = useAppContext();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) {
            return conversations;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return conversations.filter(conv => {
            const titleMatch = safeRender(conv.title).toLowerCase().includes(lowercasedQuery);
            if (titleMatch) return true;

            const messageMatch = conv.messages.some(msg => 
                safeRender(msg.text).toLowerCase().includes(lowercasedQuery)
            );
            return messageMatch;
        });
    }, [conversations, searchQuery]);

    if (!isOpen) {
        return null;
    }

    return (
        <aside className="glass-pane w-72 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">Chats</h2>
                <button 
                    onClick={handleNewConversation}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors hover-glow-indigo"
                    aria-label="New Chat"
                    title="Create a new conversation"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="relative mb-4 flex-shrink-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
            </div>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-1">
                {filteredConversations.length > 0 ? (
                    filteredConversations.map(conv => (
                       <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isActive={conv.id === activeConversationId}
                            onSelect={handleSelectConversation}
                            onDelete={handleDeleteConversation}
                        />
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center mt-4 px-4">
                        {searchQuery ? 'No matching conversations found.' : 'No chats yet. Start a new one!'}
                    </p>
                )}
            </div>
        </aside>
    );
};
