import React, { useState } from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { CloseIcon, CopyIcon, CheckIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

export const ApiUsageModal: React.FC = () => {
    const { isApiUsageOpen, setIsApiUsageOpen, globalApiKey, agentManager, agents } = useAppContext();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    if (!isApiUsageOpen) return null;

    const keySlots = [
        { type: 'Global', name: 'Fallback Key', configuredKey: globalApiKey, effectiveKey: globalApiKey, source: 'Self' },
        { type: 'Manager', name: 'Agent Manager', configuredKey: agentManager.apiKey, effectiveKey: agentManager.apiKey || globalApiKey, source: agentManager.apiKey ? 'Self' : 'Global' },
        ...agents.map(agent => ({
            type: 'Agent',
            name: agent.name,
            configuredKey: agent.apiKey,
            effectiveKey: agent.apiKey || globalApiKey,
            source: agent.apiKey ? 'Self' : 'Global'
        }))
    ];

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay open`} onClick={() => setIsApiUsageOpen(false)}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content shadow-green-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Official API Key Usage</h2>
                    <button onClick={() => setIsApiUsageOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-md mb-6">
                        <h3 className="font-bold">Developer Note</h3>
                        <p className="text-sm">Fetching real-time API usage is not supported by the client-side Gemini SDK and would require a secure backend. The information displayed here is for demonstration purposes only and does not reflect actual usage from Google's servers.</p>
                    </div>
                    {!globalApiKey ? (
                        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-6 text-center">
                            <h3 className="font-bold">Configuration Required</h3>
                            <p className="text-sm">No Global Fallback API Key is set. Please configure one in the main Settings screen for the application to function correctly.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {keySlots.map((slot, index) => (
                                <div key={index} className="glass-pane p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-400">{slot.type}: {safeRender(slot.name)}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-white font-mono break-all">
                                                    {slot.effectiveKey ? `...${slot.effectiveKey.slice(-8)}` : 'Not Set'}
                                                </p>
                                                 {slot.effectiveKey && (
                                                    <button 
                                                        onClick={() => handleCopy(slot.effectiveKey!)}
                                                        className="p-1 rounded-full text-white hover:bg-white/10 hover:text-cyan-400 transition-colors"
                                                        title="Copy API Key"
                                                    >
                                                        {copiedKey === slot.effectiveKey ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${slot.source === 'Self' ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}>
                                            {slot.source}
                                        </span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                        <p className="text-sm text-gray-300">Requests Today: <span className="font-mono text-white">N/A</span></p>
                                        <p className="text-sm text-gray-300">Tokens Today: <span className="font-mono text-white">N/A</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};