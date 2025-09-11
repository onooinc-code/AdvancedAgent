import React from 'react';
import { Message } from '../types/index.ts';
import { Spinner } from './Spinner.tsx';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { CloseIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

export const HistoryModal: React.FC = () => {
    const { isHistoryOpen, setIsHistoryOpen, historyView, isLoading, getAgent } = useAppContext();

    const renderMessage = (msg: Message) => {
        const senderName = msg.sender === 'user' ? 'You' : (getAgent(msg.sender)?.name || 'System');
        const agent = getAgent(msg.sender);
        
        let nameStyle = 'font-semibold';
        if (msg.sender === 'user') {
            nameStyle += ' text-indigo-300';
        } else if (agent) {
             const textColorClass = typeof agent.textColor === 'string' ? agent.textColor : 'text-gray-300';
             nameStyle += ` ${textColorClass} opacity-90`;
        }

        return (
            <div key={msg.id} className="text-sm">
                <span className={nameStyle}>{safeRender(senderName)}:</span>
                <span className="ml-2 whitespace-pre-wrap text-gray-300">{safeRender(msg.text)}</span>
            </div>
        );
    };

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay ${isHistoryOpen ? 'open' : ''}`} onClick={() => setIsHistoryOpen(false)}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content shadow-indigo-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Conversation History & Summary</h2>
                    <button onClick={() => setIsHistoryOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <div className="flex-1 flex justify-center items-center h-full">
                        <Spinner />
                        <span className="ml-2 text-lg">Generating summary...</span>
                    </div>
                ) : historyView ? (
                    <div className="space-y-8">
                        {/* Overall Summary */}
                        <div>
                            <h3 className="text-xl font-semibold text-indigo-400 mb-3">Overall Summary</h3>
                            <p className="text-gray-300 whitespace-pre-wrap prose prose-invert max-w-none">{safeRender(historyView.overallSummary)}</p>
                        </div>

                        {/* Topics */}
                        <div>
                            <h3 className="text-xl font-semibold text-indigo-400 mb-3">Topics Discussed</h3>
                            {historyView.topics.length > 0 ? (
                                <ul className="list-disc list-inside text-gray-300 space-y-2">
                                    {historyView.topics.map((topic, i) => <li key={i} className="bg-white/5 px-3 py-1 rounded-md">{safeRender(topic)}</li>)}
                                </ul>
                            ) : <p className="text-gray-500">No topics identified.</p>}
                        </div>

                        {/* Last Messages */}
                        {historyView.fullMessages.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold text-indigo-400 mb-3">Recent Messages</h3>
                                <div className="space-y-4 bg-black/20 p-4 rounded-lg">
                                    {historyView.fullMessages.map(renderMessage)}
                                </div>
                            </div>
                        )}

                         {/* Summarized Chunks */}
                         {historyView.summarizedMessages.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold text-indigo-400 mb-3">Earlier Conversation</h3>
                                 <div className="space-y-2 text-white text-sm border-l-2 border-indigo-500/50 pl-4">
                                    {historyView.summarizedMessages.map(chunk => (
                                        <p key={chunk.id} className="italic">...{safeRender(chunk.summary)}...</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                     <div className="flex-1 flex justify-center items-center h-full">
                        <p className="text-lg text-gray-500">No history available.</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};
