import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import * as TokenCounter from '../services/utils/tokenCounter.ts';
import { TokenIcon, StatsIcon, MessageCountIcon } from './Icons.tsx';

const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const StatusBar: React.FC = () => {
    const { activeConversation, usageMetrics, setIsAgentStatsOpen } = useAppContext();

    const conversationMessageCount = activeConversation?.messages.length ?? 0;

    const conversationTokens = useMemo(() => {
        if (!activeConversation) return 0;
        return activeConversation.messages.reduce((sum, msg) => sum + TokenCounter.estimateTokens(msg), 0);
    }, [activeConversation]);

    const todayStr = getTodayDateString();
    const todayUsage = usageMetrics.dailyUsage.find(d => d.date === todayStr) || { tokens: 0, requests: 0 };
    const totalUsage = usageMetrics.totalTokens;
    const totalRequests = usageMetrics.totalRequests;

    const formatStat = (num: number): string => {
        if (num > 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return String(num);
    };

    return (
        <footer className="glass-pane px-4 py-2 flex items-center justify-between text-xs text-white z-10">
            {/* Conversation Stats */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-300">Conversation:</span>
                <div className="flex items-center gap-1.5" title="Total messages in the current conversation">
                    <MessageCountIcon className="w-4 h-4" />
                    <span className="font-mono">{conversationMessageCount}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Estimated total tokens used in this conversation">
                    <TokenIcon className="w-4 h-4" />
                    <span className="font-mono">{formatStat(conversationTokens)}</span>
                </div>
            </div>
            
            {/* Global Usage Stats */}
            <div className="flex items-center gap-4">
                 <span className="font-semibold text-gray-300">Global Usage:</span>
                <div className="flex items-center gap-1.5" title={`Today's estimated usage: ${todayUsage.tokens} tokens / ${todayUsage.requests} requests`}>
                    <TokenIcon className="w-4 h-4 text-green-400" />
                    <span className="font-mono">Today: {formatStat(todayUsage.tokens)} / {todayUsage.requests} reqs</span>
                </div>
                 <div className="flex items-center gap-1.5" title={`Total estimated usage: ${totalUsage} tokens / ${totalRequests} requests`}>
                    <TokenIcon className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono">Total: {formatStat(totalUsage)} / {totalRequests} reqs</span>
                </div>
                <button 
                    onClick={() => setIsAgentStatsOpen(true)} 
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors hover-glow-indigo" 
                    title="View agent-specific usage statistics"
                    aria-label="View Agent Statistics"
                >
                    <StatsIcon className="w-4 h-4" />
                </button>
            </div>
        </footer>
    );
};