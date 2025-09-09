
import React, { useState, useEffect } from 'react';
import { SettingsIconV2, HistoryIconV2, MenuIcon, EditIcon, CheckIcon, SparklesIcon, ConversationSettingsIcon, UsersIconV2, CloudIcon } from './Icons.tsx';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Conversation } from '../types/index.ts';
import { Spinner } from './Spinner.tsx';

interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    conversation: Conversation | null;
}

const HeaderButton: React.FC<{onClick: () => void, disabled?: boolean, title: string, 'aria-label': string, children: React.ReactNode}> = ({ onClick, disabled, title, 'aria-label': ariaLabel, children }) => (
    <button 
        onClick={onClick} 
        disabled={disabled} 
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-glow-indigo" 
        title={title}
        aria-label={ariaLabel}
    >
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = ({ toggleSidebar, conversation }) => {
    const { 
        conversationMode, 
        setConversationMode, 
        setIsSettingsOpen,
        setIsTeamGeneratorOpen,
        setIsConversationSettingsOpen,
        setIsApiUsageOpen,
        handleShowHistory, 
        handleUpdateConversationTitle,
        handleGenerateTitle
    } = useAppContext();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(conversation?.title || '');

    useEffect(() => {
        if (conversation) {
            setTitle(conversation.title);
            setIsEditingTitle(false);
        }
    }, [conversation]);

    const handleTitleSave = () => {
        if (conversation && title.trim()) {
            handleUpdateConversationTitle(conversation.id, title.trim());
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setTitle(conversation?.title || '');
            setIsEditingTitle(false);
        }
    }
    
    return (
        <header className="glass-pane p-3 flex justify-between items-center flex-shrink-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle Sidebar" title="Toggle conversation list">
                    <MenuIcon />
                </button>
                {conversation ? (
                    <div className="flex items-center gap-2">
                        {isEditingTitle ? (
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleTitleKeydown}
                                onBlur={handleTitleSave}
                                className="bg-transparent text-white text-xl font-bold rounded px-2 py-0.5 outline-none ring-2 ring-indigo-500"
                                autoFocus
                            />
                        ) : (
                            <h1 className="text-xl font-bold text-white">{conversation.title}</h1>
                        )}
                        
                        {conversation?.discussionSettings?.enabled && (
                            <span className="ml-2 bg-purple-500/50 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-400/50">Moderated Chat</span>
                        )}

                        {isEditingTitle ? (
                            <button onClick={handleTitleSave} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Save title" title="Save title">
                                <CheckIcon />
                            </button>
                        ) : (
                             <div className="flex items-center gap-1">
                                <button onClick={() => setIsEditingTitle(true)} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Edit title" title="Edit conversation title">
                                    <EditIcon />
                                </button>
                                <button
                                    onClick={() => handleGenerateTitle(conversation.id)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-yellow-400 hover-glow-indigo transition-shadow"
                                    aria-label="Generate title with AI"
                                    disabled={conversation.isGeneratingTitle}
                                    title="Generate title with AI"
                                >
                                    {conversation.isGeneratingTitle ? <Spinner/> : <SparklesIcon />}
                                </button>
                                <button 
                                    onClick={() => setIsConversationSettingsOpen(true)} 
                                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                    aria-label="Conversation Settings"
                                    disabled={!conversation}
                                    title="Open conversation settings"
                                >
                                    <ConversationSettingsIcon />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <h1 className="text-xl font-bold text-white">Advanced AI Assistant</h1>
                )}
            </div>
            <div className="flex items-center gap-4">
                {/* Conversation Mode Toggle */}
                <div className="flex items-center glass-pane rounded-full p-1">
                    <button
                        onClick={() => setConversationMode('Dynamic')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        conversationMode === 'Dynamic' ? 'bg-indigo-600 text-white neon-glow-indigo' : 'text-gray-300 hover:bg-white/5'
                        }`}
                        aria-pressed={conversationMode === 'Dynamic'}
                        title="AI Manager creates a dynamic plan for each turn"
                    >
                        Dynamic
                    </button>
                    <button
                        onClick={() => setConversationMode('AI')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        conversationMode === 'AI' ? 'bg-indigo-600 text-white neon-glow-indigo' : 'text-gray-300 hover:bg-white/5'
                        }`}
                        aria-pressed={conversationMode === 'AI'}
                        title="AI Agent manages the conversation flow"
                    >
                        AI Agent
                    </button>
                    <button
                        onClick={() => setConversationMode('Manual')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        conversationMode === 'Manual' ? 'bg-indigo-600 text-white neon-glow-indigo' : 'text-gray-300 hover:bg-white/5'
                        }`}
                        aria-pressed={conversationMode === 'Manual'}
                        title="Manually choose which agent responds"
                    >
                        Manual
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 text-sm">
                    <HeaderButton onClick={() => setIsTeamGeneratorOpen(true)} title="Generate a new team of AI agents" aria-label="Open Team Generator">
                        <UsersIconV2 />
                        <span>Team Gen</span>
                    </HeaderButton>
                     <HeaderButton onClick={() => setIsApiUsageOpen(true)} title="View Official API Key Usage" aria-label="Open API Usage">
                        <CloudIcon />
                        <span>API Usage</span>
                    </HeaderButton>
                     <HeaderButton onClick={() => setIsSettingsOpen(true)} title="Open global application settings" aria-label="Open Settings">
                        <SettingsIconV2 />
                        <span>Settings</span>
                    </HeaderButton>
                     <HeaderButton onClick={handleShowHistory} disabled={!conversation} title="View conversation history summary" aria-label="View History">
                        <HistoryIconV2 />
                        <span>History</span>
                    </HeaderButton>
                </div>
            </div>
        </header>
    );
};
