
import React from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';

export const ManualSuggestions: React.FC = () => {
    const { manualSuggestions, agents, handleManualSelection, isLoading } = useAppContext();
    
    if (manualSuggestions.length === 0) return null;

    return (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
            <p className="text-sm text-center text-gray-400 mb-3">Who should respond?</p>
            <div className="flex justify-center flex-wrap gap-2">
                {manualSuggestions.map(({ agentId, reason }) => {
                    const agent = agents.find(a => a.id === agentId);
                    if (!agent) return null;
                    return (
                        <button
                            key={agentId}
                            onClick={() => handleManualSelection(agentId)}
                            title={reason}
                            className={`px-4 py-2 rounded-lg font-semibold transition-transform transform hover:scale-105 ${agent.color} ${agent.textColor}`}
                        >
                            {agent.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
