import React from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { TokenIcon, CpuIcon, CloseIcon, MessageCountIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AgentStatsModal: React.FC = () => {
    const { isAgentStatsOpen, setIsAgentStatsOpen, agents, usageMetrics } = useAppContext();

    if (!isAgentStatsOpen) return null;

    const todayStr = getTodayDateString();

    const formatTokens = (tokens: number) => {
        if (tokens > 1000) {
            return `${(tokens / 1000).toFixed(1)}k`;
        }
        return tokens;
    };

    const managerStats = usageMetrics.agentUsage['manager'] || { totalMessages: 0, dailyUsage: [] };
    const managerTodayStats = managerStats.dailyUsage.find(d => d.date === todayStr) || { tokens: 0, messages: 0 };


    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay ${isAgentStatsOpen ? 'open' : ''}`} onClick={() => setIsAgentStatsOpen(false)}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content shadow-indigo-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Agent Performance Statistics</h2>
                    <button onClick={() => setIsAgentStatsOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Manager Card */}
                        <div className={`glass-pane p-4 rounded-lg shadow-md border-t-4 border-yellow-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/20`}>
                            <div className="flex flex-col h-full">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white">Agent Manager</h3>
                                    <p className={`text-sm opacity-80 text-yellow-300`}>Conversation Orchestrator</p>
                                </div>
                                <div className="space-y-4 mt-auto">
                                    <div className="flex items-center gap-3 glass-pane p-3 rounded-md">
                                        <TokenIcon className="w-6 h-6 text-green-400" />
                                        <div>
                                            <p className="font-bold text-lg text-white font-mono">{formatTokens(managerTodayStats.tokens)}</p>
                                            <p className="text-xs text-white">Tokens Today (Requests)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 glass-pane p-3 rounded-md">
                                        <CpuIcon className="w-6 h-6 text-cyan-400" />
                                        <div>
                                            <p className="font-bold text-lg text-white font-mono">{managerStats.totalMessages}</p>
                                            <p className="text-xs text-white">Total Decisions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agent Cards */}
                        {agents.map(agent => {
                            const stats = usageMetrics.agentUsage[agent.id] || { totalMessages: 0, dailyUsage: [] };
                            const todayStats = stats.dailyUsage.find(d => d.date === todayStr) || { tokens: 0, messages: 0 };
                            
                            return (
                                <div key={agent.id} className={`glass-pane p-4 rounded-lg shadow-md border-t-4 ${agent.color.replace('bg','border')} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20`}>
                                    <div className="flex flex-col h-full">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-white">{safeRender(agent.name)}</h3>
                                            <p className={`text-sm opacity-80`}>{safeRender(agent.job)}</p>
                                        </div>
                                        <div className="space-y-4 mt-auto">
                                            <div className="flex items-center gap-3 glass-pane p-3 rounded-md">
                                                <TokenIcon className="w-6 h-6 text-green-400" />
                                                <div>
                                                    <p className="font-bold text-lg text-white font-mono">{formatTokens(todayStats.tokens)}</p>
                                                    <p className="text-xs text-white">Tokens Today</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 glass-pane p-3 rounded-md">
                                                <MessageCountIcon className="w-6 h-6 text-cyan-400" />
                                                <div>
                                                    <p className="font-bold text-lg text-white font-mono">{stats.totalMessages}</p>
                                                    <p className="text-xs text-white">Total Messages</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};