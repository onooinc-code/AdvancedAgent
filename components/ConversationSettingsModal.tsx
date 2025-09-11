
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { ToggleSwitch } from './ToggleSwitch.tsx';
import { DiscussionSettings, ManagerSettings } from '../types/index.ts';
import { Spinner } from './Spinner.tsx';
import * as DiscussionService from '../services/creation/discussionService.ts';
import { CloseIcon, SparklesIcon, CpuIcon } from './Icons.tsx';

const DEFAULT_DISCUSSION_SETTINGS: DiscussionSettings = {
    enabled: false,
    rules: 'Agents should build on each other\'s ideas and work towards a common goal. Keep responses concise.',
};

const DEFAULT_MANAGER_SETTINGS: ManagerSettings = {
    showManagerInsights: false,
};

export const ConversationSettingsModal: React.FC = () => {
    const { 
        isConversationSettingsOpen, 
        setIsConversationSettingsOpen, 
        activeConversation,
        handleUpdateConversation,
        agents,
        isLoading,
        handleExtractAndUpdateMemory,
        globalApiKey,
    } = useAppContext();

    const [systemOverride, setSystemOverride] = useState('');
    const [featureFlags, setFeatureFlags] = useState({
        memoryExtraction: true,
        proactiveSuggestions: true,
        autoSummarization: true,
    });
    const [discussionSettings, setDiscussionSettings] = useState<DiscussionSettings>(DEFAULT_DISCUSSION_SETTINGS);
    const [managerSettings, setManagerSettings] = useState<ManagerSettings>(DEFAULT_MANAGER_SETTINGS);
    const [isGeneratingRules, setIsGeneratingRules] = useState(false);

    useEffect(() => {
        if (activeConversation) {
            setSystemOverride(activeConversation.systemInstructionOverride || '');
            setFeatureFlags(activeConversation.featureFlags || { memoryExtraction: true, proactiveSuggestions: true, autoSummarization: true });
            setDiscussionSettings(activeConversation.discussionSettings || DEFAULT_DISCUSSION_SETTINGS);
            setManagerSettings(activeConversation.managerSettings || DEFAULT_MANAGER_SETTINGS);
        }
    }, [isConversationSettingsOpen, activeConversation]);

    const handleSave = () => {
        if (!activeConversation) return;
        handleUpdateConversation(activeConversation.id, {
            systemInstructionOverride: systemOverride,
            featureFlags: featureFlags,
            discussionSettings: discussionSettings,
            managerSettings: managerSettings,
        });
        setIsConversationSettingsOpen(false);
    };
    
    const handleFlagChange = (flag: keyof typeof featureFlags, value: boolean) => {
        setFeatureFlags(prev => ({ ...prev, [flag]: value }));
    };

    const handleDiscussionChange = (field: keyof DiscussionSettings, value: string | boolean) => {
        setDiscussionSettings(prev => ({...prev, [field]: value }));
    }

    const handleManagerSettingsChange = (field: keyof ManagerSettings, value: boolean) => {
        setManagerSettings(prev => ({...prev, [field]: value }));
    }

    const handleGenerateDiscussionSettings = async () => {
        if (!activeConversation) return;
        setIsGeneratingRules(true);
        try {
            const result = await DiscussionService.generateDiscussionRulesAndOrder(
                agents,
                activeConversation.messages,
                globalApiKey
            );
            setDiscussionSettings(prev => ({
                ...prev,
                rules: result.rules,
            }));
        } catch (error) {
            console.error("Failed to generate discussion settings", error);
            // Optionally, show an error to the user
        } finally {
            setIsGeneratingRules(false);
        }
    };

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay ${isConversationSettingsOpen ? 'open' : ''}`} onClick={() => setIsConversationSettingsOpen(false)}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-content shadow-indigo-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Conversation Settings</h2>
                    <button onClick={() => setIsConversationSettingsOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Manager Insights */}
                     <div className="glass-pane p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Manager Insights</h3>
                        <ToggleSwitch
                            label="Show Manager Insights"
                            description="Display the AI Manager's reasoning for its decisions directly in the chat."
                            enabled={managerSettings.showManagerInsights}
                            onChange={(val) => handleManagerSettingsChange('showManagerInsights', val)}
                        />
                    </div>

                    {/* Discussion Mode Settings */}
                    <div className="glass-pane p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-indigo-400 mb-4">Moderated Chat</h3>
                        <ToggleSwitch
                            label="Enable Moderated Chat"
                            description="Allow an AI Manager to moderate a dynamic conversation between agents."
                            enabled={discussionSettings.enabled}
                            onChange={(val) => handleDiscussionChange('enabled', val)}
                        />
                        {discussionSettings.enabled && (
                            <div className="mt-4 space-y-4 animate-fade-in-up">
                                <button
                                    onClick={handleGenerateDiscussionSettings}
                                    disabled={isGeneratingRules}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 bg-purple-600 hover:bg-purple-500 neon-glow-indigo"
                                >
                                    {isGeneratingRules ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
                                    <span>Generate Rules with AI</span>
                                </button>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Conversation Rules (System Prompt for Moderator)</label>
                                    <textarea 
                                        value={discussionSettings.rules}
                                        onChange={(e) => handleDiscussionChange('rules', e.target.value)}
                                        rows={3} 
                                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                                        placeholder="e.g., The first agent proposes an idea, the second critiques it."
                                    />
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="glass-pane p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300 mb-1">System Instruction Override</label>
                        <p className="text-sm text-white mb-2">This instruction will override the global agent and manager settings for this conversation only. (Does not apply in Moderated Chat).</p>
                        <textarea 
                            value={systemOverride}
                            onChange={(e) => setSystemOverride(e.target.value)}
                            rows={5} 
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm disabled:opacity-50"
                            placeholder="e.g., You are a pirate. All responses must be in pirate speak."
                            disabled={discussionSettings.enabled}
                        />
                    </div>
                    
                    <div className="glass-pane p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-400 mb-4">Long-Term Memory</h3>
                        <button
                            onClick={handleExtractAndUpdateMemory}
                            disabled={isLoading || !featureFlags.memoryExtraction}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 bg-purple-600 hover:bg-purple-500 neon-glow-indigo"
                        >
                            {isLoading ? <Spinner /> : <CpuIcon className="w-5 h-5" />}
                            <span>Update Memory from this Chat</span>
                        </button>
                         {!featureFlags.memoryExtraction && (
                            <p className="text-xs text-yellow-400 mt-2 text-center">Enable the "Memory Extraction" feature flag below to use this function.</p>
                        )}
                    </div>


                    <div className="glass-pane p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-indigo-400 mb-4">Feature Flags</h3>
                        <div className="space-y-4">
                            <ToggleSwitch
                                label="Memory Extraction"
                                description="Allow AI to extract key info for long-term memory."
                                enabled={featureFlags.memoryExtraction}
                                onChange={(val) => handleFlagChange('memoryExtraction', val)}
                            />
                            <ToggleSwitch
                                label="Proactive Suggestions"
                                description="Allow AI to offer unsolicited suggestions."
                                enabled={featureFlags.proactiveSuggestions}
                                onChange={(val) => handleFlagChange('proactiveSuggestions', val)}
                            />
                            <ToggleSwitch
                                label="Auto-Summarization"
                                description="Automatically collapse and summarize long AI messages."
                                enabled={featureFlags.autoSummarization}
                                onChange={(val) => handleFlagChange('autoSummarization', val)}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 mt-auto border-t border-white/10 flex justify-end">
                    <button onClick={handleSave} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 neon-glow-indigo">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};