
import React, { useState } from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Agent, TeamComponent } from '../types/index.ts';
import { Spinner } from './Spinner.tsx';
import * as TeamGenerationService from '../services/creation/teamGenerationService.ts';
import { CloseIcon, SparklesIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

type LoadingStage = 'idle' | 'prompt' | 'components' | 'final';

export const TeamGeneratorModal: React.FC = () => {
    const { isTeamGeneratorOpen, setIsTeamGeneratorOpen, handleReplaceAgents, globalApiKey } = useAppContext();

    const [topic, setTopic] = useState('Quantum Computing');
    const [goal, setGoal] = useState('Create an educational YouTube series for beginners');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [teamComponents, setTeamComponents] = useState<TeamComponent[] | null>(null);
    const [finalAgents, setFinalAgents] = useState<Agent[] | null>(null);
    const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleClear = () => {
        setTopic('');
        setGoal('');
        setGeneratedPrompt('');
        setTeamComponents(null);
        setFinalAgents(null);
        setError(null);
    };

    const handleGeneratePrompt = async () => {
        setLoadingStage('prompt');
        setError(null);
        try {
            const prompt = await TeamGenerationService.generateTeamPrompt(topic, goal, globalApiKey);
            setGeneratedPrompt(prompt);
        } catch (e) {
            setError('Failed to generate prompt. Please try again.');
        } finally {
            setLoadingStage('idle');
        }
    };

    const handleGenerateComponents = async () => {
        setLoadingStage('components');
        setError(null);
        let promptToUse = generatedPrompt;
        if (!promptToUse) {
            try {
                promptToUse = await TeamGenerationService.generateTeamPrompt(topic, goal, globalApiKey);
                setGeneratedPrompt(promptToUse);
            } catch (e) {
                setError('Failed to generate prerequisite prompt. Please try again.');
                setLoadingStage('idle');
                return;
            }
        }
        try {
            const components = await TeamGenerationService.generateTeamComponents(promptToUse, globalApiKey);
            setTeamComponents(components);
        } catch (e) {
            setError('Failed to generate team components. The model might have returned an unexpected format. Try regenerating the prompt.');
        } finally {
            setLoadingStage('idle');
        }
    };

    const handleGenerateFinal = async () => {
        if (!teamComponents) {
            setError('Please generate team components first.');
            return;
        }
        setLoadingStage('final');
        setError(null);
        try {
            const generatedDetails = await TeamGenerationService.generateFinalAgents(teamComponents, globalApiKey);
            const fullAgents = teamComponents.map((comp, index) => {
                const { jobTitle, ...restOfComp } = comp;
                return {
                    id: `agent-${index + 1}`,
                    model: 'gemini-2.5-flash',
                    ...restOfComp, // includes name, role, goals, etc.
                    job: jobTitle, // map jobTitle to job
                    ...generatedDetails[index],
                };
            });
            setFinalAgents(fullAgents as Agent[]);
        } catch (e) {
            setError('Failed to generate final agent details. Please try again.');
        } finally {
            setLoadingStage('idle');
        }
    };
    
    const handleApprove = () => {
        if (finalAgents) {
            handleReplaceAgents(finalAgents);
        }
    };
    
    const renderActionButton = (text: string, onClick: () => void, stage: LoadingStage, color: string, glowColor: string) => (
        <button
            onClick={onClick}
            disabled={loadingStage !== 'idle'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 ${color} ${glowColor}`}
        >
            {loadingStage === stage ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
            <span>{text}</span>
        </button>
    );

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay ${isTeamGeneratorOpen ? 'open' : ''}`} onClick={() => setIsTeamGeneratorOpen(false)}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col modal-content shadow-indigo-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">AI-Powered Team Generator</h2>
                    <button onClick={() => setIsTeamGeneratorOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                {error && <div className="m-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-md animate-fade-in-up">{error}</div>}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Phase 1: Inputs */}
                    <div className="glass-pane p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
                            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white" placeholder="What is the team's subject matter?" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Goal</label>
                            <input type="text" value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white" placeholder="What is the team's primary objective?" />
                        </div>
                    </div>

                    {/* Phase 1 Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderActionButton('Generate Prompt', handleGeneratePrompt, 'prompt', 'bg-blue-600 hover:bg-blue-500', 'neon-glow-indigo')}
                        {renderActionButton('Generate Team Concepts', handleGenerateComponents, 'components', 'bg-green-600 hover:bg-green-500', 'neon-glow-indigo')}
                         <button onClick={handleClear} disabled={loadingStage !== 'idle'} className="w-full px-4 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 neon-glow-indigo">
                            Clear All
                        </button>
                    </div>

                    {/* Phase 2: Intermediate Results */}
                    {(generatedPrompt || teamComponents) && (
                        <div className="space-y-6 animate-fade-in-up">
                            {generatedPrompt && (
                                <div className="glass-pane p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">Generated Prompt</h3>
                                    <textarea value={generatedPrompt} onChange={e => setGeneratedPrompt(e.target.value)} rows={4} className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white font-mono text-sm"></textarea>
                                </div>
                            )}
                            {teamComponents && (
                                <div className="glass-pane p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">Generated Team Concepts</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {teamComponents.map((agent, i) => (
                                            <div key={i} className="bg-black/20 p-4 rounded-lg space-y-2 border-l-4 border-cyan-500">
                                                <h4 className="text-xl font-bold text-white">{safeRender(agent.name)}</h4>
                                                <p><span className="font-semibold text-white">Job:</span> {safeRender(agent.jobTitle)}</p>
                                                <p><span className="font-semibold text-white">Role:</span> {safeRender(agent.role)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Phase 3: Final Actions */}
                    {teamComponents && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white animate-fade-in-up">
                            {renderActionButton('Generate Final Team', handleGenerateFinal, 'final', 'bg-purple-600 hover:bg-purple-500', 'neon-glow-indigo')}
                            {renderActionButton('Regenerate Concepts', handleGenerateComponents, 'components', 'bg-yellow-600 hover:bg-yellow-500', 'neon-glow-indigo')}
                        </div>
                    )}

                    {/* Phase 4: Final Results */}
                    {finalAgents && (
                        <div className="animate-fade-in-up">
                            <h3 className="text-xl font-semibold text-green-400 mb-4">Final Team Ready!</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {finalAgents.map(agent => (
                                    <div key={agent.id} className={`glass-pane p-4 rounded-lg shadow-md border-t-4 ${agent.color.replace('bg','border')} space-y-3`}>
                                        <h4 className="text-xl font-bold text-white">{safeRender(agent.name)}</h4>
                                        <p><span className="font-semibold opacity-80">Job:</span> {safeRender(agent.job)}</p>
                                        <p className="text-sm"><span className="font-semibold opacity-80">Instruction:</span> {safeRender(agent.systemInstruction)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button onClick={handleApprove} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105 neon-glow-indigo">Approve & Use Team</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
