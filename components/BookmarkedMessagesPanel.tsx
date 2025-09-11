import React from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Message } from '../types/index.ts';
import { CloseIcon, BookmarkFilledIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

interface BookmarkItemProps {
    message: Message;
    onClick: () => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ message, onClick }) => {
    const { getAgent } = useAppContext();
    const isUser = message.sender === 'user';
    const sender = isUser ? { name: 'You' } : getAgent(message.sender);
    const text = safeRender(message.text);
    const snippet = text.substring(0, 100) + (text.length > 100 ? '...' : '');

    return (
        <div 
            className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            onClick={onClick}
            role="button"
            title="Go to message"
        >
            <div className="flex justify-between items-center text-xs text-white mb-1">
                <span className="font-semibold">{safeRender(sender?.name || 'Agent')}</span>
                <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-sm text-gray-300 italic">"{snippet}"</p>
        </div>
    );
};


export const BookmarkedMessagesPanel: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { activeConversation, setIsBookmarksPanelOpen } = useAppContext();

    const bookmarkedMessages = activeConversation?.messages.filter(m => m.isBookmarked).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || [];

    const handleGoToMessage = (messageId: string) => {
        const element = document.getElementById(messageId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-flash');
            setTimeout(() => {
                element.classList.remove('highlight-flash');
            }, 1500);
        }
    };

    return (
        <aside 
            className={`transition-all duration-300 ease-in-out glass-pane flex-shrink-0 flex flex-col ${isOpen ? 'w-80' : 'w-0'}`}
            style={{ overflow: 'hidden' }}
        >
            <div className={`p-4 flex flex-col h-full ${!isOpen ? 'hidden' : ''}`}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <BookmarkFilledIcon className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-semibold text-white">Bookmarks</h2>
                    </div>
                    <button 
                        onClick={() => setIsBookmarksPanelOpen(false)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close Bookmarks Panel"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2">
                    {bookmarkedMessages.length > 0 ? (
                        bookmarkedMessages.map(msg => (
                            <BookmarkItem 
                                key={msg.id}
                                message={msg}
                                onClick={() => handleGoToMessage(msg.id)}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <BookmarkFilledIcon className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm">No bookmarked messages in this conversation.</p>
                            <p className="text-xs mt-1">Click the bookmark icon on any message to save it here.</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
