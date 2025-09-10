

import React, { useState, useEffect } from 'react';
import { SettingsIconV2, HistoryIconV2, MenuIcon, EditIcon, CheckIcon, SparklesIcon, ConversationSettingsIcon, UsersIconV2, CloudIcon, BookmarkFilledIcon, PowerIcon } from './Icons.tsx';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Conversation, Agent } from '../types/index.ts';
import { Spinner } from './Spinner.tsx';

// --- SHARED COMPONENTS ---

const HeaderButton: React.FC<{onClick: () => void, disabled?: boolean, title: string, 'aria-label': string, children: React.ReactNode}> = ({ onClick, disabled, title, 'aria-label': ariaLabel, children }) => (
    <button 
        onClick={onClick} 
        disabled={disabled} 
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-glow-indigo" 
        title={title}
        aria-label={ariaLabel}
    >
        {children}
    </button>
);

const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
    const { usageMetrics, lastTurnAgentIds, handleToggleAgentEnabled } = useAppContext();
    const todayStr = getTodayDateString();
    
    const stats = usageMetrics.agentUsage[agent.id] || { totalMessages: 0, dailyUsage: [] };
    const todayStats = stats.dailyUsage.find(d => d.date === todayStr) || { tokens: 0, messages: 0 };
    const wasUsed = lastTurnAgentIds.has(agent.id);
    const isEnabled = agent.isEnabled ?? true;

    const formatStat = (num: number) => {
        if (num > 1000) return `${(num / 1000).toFixed(1)}k`;
        return num;
    };

    return (
        <div className="flex-1 min-w-[150px] glass-pane rounded-lg flex flex-col transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20">
            <div className={`flex items-center justify-between p-2 border-b-2 ${agent.color.replace('bg-', 'border-')}`}>
                <h3 className="font-bold text-sm text-white truncate">{agent.name}</h3>
            </div>
            <div className="flex-1 p-2 flex items-center justify-around text-center">
                <div className="flex-1 flex flex-col items-center justify-center" title={isEnabled ? 'Click to Disable Agent' : 'Click to Enable Agent'}>
                    <button onClick={() => handleToggleAgentEnabled(agent.id)} className={`p-2 rounded-full transition-colors ${isEnabled ? 'text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'text-gray-500 hover:bg-green-500/20 hover:text-green-400'}`}>
                        <PowerIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center" title={wasUsed ? "Used in last turn" : "Not used in last turn"}>
                    <div className={`w-4 h-4 rounded-full ${wasUsed ? 'bg-green-400 flashing-dot' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center" title="Tokens used today (estimate)">
                     <p className="font-mono font-bold text-sm text-white">{formatStat(todayStats.tokens)}</p>
                     <p className="text-xs text-gray-400">Tokens</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center" title="Requests today (estimate)">
                    <p className="font-mono font-bold text-sm text-white">{todayStats.messages}</p>
                    <p className="text-xs text-gray-400">Reqs</p>
                </div>
            </div>
        </div>
    );
};


// --- HEADER VARIATIONS ---

const DashboardHeader: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
    const { agents, setIsSettingsOpen, setIsTeamGeneratorOpen, setIsApiUsageOpen } = useAppContext();
    return (
        <header 
            className="p-2 flex justify-between items-stretch gap-2 flex-shrink-0 z-20 border-b border-white/10 shadow-lg"
            style={{
                background: 'linear-gradient(-45deg, #0a0a0f, #1e293b, #3b0764, #1e293b, #0a0a0f)',
                backgroundSize: '400% 400%',
                animation: 'animated-gradient-bg 15s ease infinite'
            }}
        >
            <div className="w-[30%] flex items-center gap-2">
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle Sidebar" title="Toggle conversation list">
                    <MenuIcon />
                </button>
            </div>

            <div className="w-[40%] flex flex-col">
                 <div className="h-[40%] flex items-center justify-center">
                    <h1 
                        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400"
                        style={{ backgroundSize: '200% 200%', animation: 'animated-gradient-text 5s ease infinite' }}
                    >
                        Advanced AI Assistant
                    </h1>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2">
                    {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
                </div>
            </div>

            <div className="w-[30%] flex items-end justify-end">
                <div className="flex items-center gap-1 text-xs">
                    <HeaderButton onClick={() => setIsTeamGeneratorOpen(true)} title="Generate Team" aria-label="Open Team Generator"><UsersIconV2 className="w-5 h-5"/></HeaderButton>
                    <HeaderButton onClick={() => setIsApiUsageOpen(true)} title="API Usage" aria-label="Open API Usage"><CloudIcon className="w-5 h-5"/></HeaderButton>
                    <HeaderButton onClick={() => setIsSettingsOpen(true)} title="Settings" aria-label="Open Settings"><SettingsIconV2 className="w-5 h-5"/></HeaderButton>
                </div>
            </div>
        </header>
    );
};

const ConversationHeader: React.FC<{ toggleSidebar: () => void, conversation: Conversation }> = ({ toggleSidebar, conversation }) => {
    const {
        conversationMode, 
        setConversationMode, 
        setIsSettingsOpen,
        setIsTeamGeneratorOpen,
        setIsConversationSettingsOpen,
        setIsApiUsageOpen,
        isBookmarksPanelOpen,
        setIsBookmarksPanelOpen,
        handleShowHistory, 
        handleUpdateConversationTitle,
        handleGenerateTitle,
        activeConversation,
    } = useAppContext();
    
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(conversation.title || '');

    useEffect(() => {
        setTitle(conversation.title);
        setIsEditingTitle(false);
    }, [conversation]);

    const handleTitleSave = () => {
        if (title.trim()) {
            handleUpdateConversationTitle(conversation.id, title.trim());
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleTitleSave();
        else if (e.key === 'Escape') {
            setTitle(conversation.title || '');
            setIsEditingTitle(false);
        }
    };

    const bookmarkedCount = activeConversation?.messages.filter(m => m.isBookmarked).length || 0;

    return (
        <header className="p-2 flex justify-between items-center flex-shrink-0 z-20 border-b border-white/10 shadow-md bg-[var(--color-primary-header)]">
            {/* Left */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle Sidebar" title="Toggle conversation list">
                    <MenuIcon />
                </button>
                 <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isEditingTitle ? (
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleTitleKeydown}
                            onBlur={handleTitleSave}
                            className="bg-transparent text-white text-lg font-bold rounded px-2 py-0.5 outline-none ring-2 ring-indigo-500 w-full"
                            autoFocus
                        />
                    ) : (
                         <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-white truncate">{conversation.title}</h1>
                            {conversation.discussionSettings?.enabled && (
                                <span className="bg-purple-500/50 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-400/50 flex-shrink-0">Moderated</span>
                            )}
                        </div>
                    )}
                    
                    {isEditingTitle ? (
                        <button onClick={handleTitleSave} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Save title" title="Save title">
                            <CheckIcon />
                        </button>
                    ) : (
                         <div className="flex items-center gap-1">
                            <button onClick={() => setIsEditingTitle(true)} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Edit title" title="Edit conversation title"> <EditIcon /> </button>
                            <button onClick={() => handleGenerateTitle(conversation.id)} className="p-1.5 rounded-full hover:bg-white/10 text-yellow-400 hover-glow-indigo" disabled={conversation.isGeneratingTitle} title="Generate title with AI"> {conversation.isGeneratingTitle ? <Spinner/> : <SparklesIcon />} </button>
                            <button onClick={() => setIsConversationSettingsOpen(true)} className="p-1.5 rounded-full hover:bg-white/10" disabled={!conversation} title="Open conversation settings"> <ConversationSettingsIcon /> </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Middle */}
            <div className="flex-none mx-4">
                <div className="flex items-center glass-pane rounded-full p-1 text-xs">
                    <button onClick={() => setConversationMode('Dynamic')} title="AI Manager creates a dynamic plan" className={`px-3 py-1 font-semibold rounded-full transition-all ${ conversationMode === 'Dynamic' ? 'bg-indigo-600 text-white neon-glow-indigo' : 'text-gray-300 hover:bg-white/5' }`}> Dynamic </button>
                    <button onClick={() => setConversationMode('AI')} title="AI Agent manages the flow" className={`px-3 py-1 font-semibold rounded-full transition-all ${ conversationMode === 'AI' ? 'bg-indigo-600 text-white neon-glow-indigo' : 'text-gray-300 hover:bg-white/5' }`}> AI Agent </button>
                    <button onClick={() => setConversationMode('Manual')} title="Manually choose the agent" className={`px-3 py-1 font-semibold rounded-full transition-all ${ conversationMode === 'Manual' ? 'bg-indigo-600 text-white neon-glow-indigo' : 'text-gray-300 hover:bg-white/5' }`}> Manual </button>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 text-xs justify-end flex-1">
                <HeaderButton onClick={() => setIsTeamGeneratorOpen(true)} title="Generate Team" aria-label="Open Team Generator"><UsersIconV2 className="w-5 h-5"/></HeaderButton>
                <HeaderButton onClick={() => setIsApiUsageOpen(true)} title="API Usage" aria-label="Open API Usage"><CloudIcon className="w-5 h-5"/></HeaderButton>
                <HeaderButton onClick={() => setIsSettingsOpen(true)} title="Settings" aria-label="Open Settings"><SettingsIconV2 className="w-5 h-5"/></HeaderButton>
                <HeaderButton onClick={() => setIsBookmarksPanelOpen(!isBookmarksPanelOpen)} disabled={!conversation} title="Bookmarks" aria-label="View Bookmarks">
                    <BookmarkFilledIcon className="w-5 h-5" />
                    {bookmarkedCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold ring-2 ring-[#1e293b]">{bookmarkedCount}</span>}
                </HeaderButton>
                <HeaderButton onClick={handleShowHistory} disabled={!conversation} title="History" aria-label="View History"><HistoryIconV2 className="w-5 h-5"/></HeaderButton>
            </div>
        </header>
    );
};


// Main Header component conditionally renders the correct version
export const Header: React.FC<{ isSidebarOpen: boolean, toggleSidebar: () => void, conversation: Conversation | null }> = ({ isSidebarOpen, toggleSidebar, conversation }) => {
    if (conversation) {
        return <ConversationHeader toggleSidebar={toggleSidebar} conversation={conversation} />;
    }
    return <DashboardHeader toggleSidebar={toggleSidebar} />;
};
