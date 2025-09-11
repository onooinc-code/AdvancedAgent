
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { PipelineStep } from '../types/index.ts';
import { CloseIcon } from './Icons.tsx';

const CodeBlock: React.FC<{ data: any }> = ({ data }) => {
    let content;
    try {
        content = JSON.stringify(data, null, 2);
    } catch {
        content = String(data);
    }
    return (
        <pre className="bg-black/30 text-sm text-cyan-300 p-3 rounded-md max-h-60 overflow-y-auto font-mono">
            <code>{content}</code>
        </pre>
    );
};


export const CognitiveInspectorModal: React.FC = () => {
    const { inspectorData, isInspectorOpen, closeInspectorModal } = useAppContext();
    const [openStepIndex, setOpenStepIndex] = useState<number | null>(null);

    useEffect(() => {
        // Automatically open the first step when the modal is opened
        if (isInspectorOpen && inspectorData && inspectorData.length > 0) {
            setOpenStepIndex(0);
        } else {
            setOpenStepIndex(null);
        }
    }, [isInspectorOpen, inspectorData]);

    const toggleStep = (index: number) => {
        setOpenStepIndex(openStepIndex === index ? null : index);
    };
    
    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay ${isInspectorOpen ? 'open' : ''}`} onClick={closeInspectorModal}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content shadow-indigo-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Workflow Visualizer</h2>
                    <button onClick={closeInspectorModal} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                     <div className="relative">
                        {/* The timeline track, only shown if there are multiple steps */}
                        {inspectorData && inspectorData.length > 1 && <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-indigo-500/30"></div>}

                        {inspectorData?.map((step: PipelineStep, index: number) => (
                            <div key={index} className="relative pl-12 pb-8 last:pb-0">
                                {/* Timeline Dot */}
                                <div className="absolute left-[13px] top-1 w-5 h-5 bg-indigo-500 rounded-full border-4 border-gray-800 flex items-center justify-center ring-4 ring-indigo-500/20">
                                     <span className="text-white text-xs font-bold">{index + 1}</span>
                                </div>
                                
                                {/* Content Card */}
                                <div className="glass-pane rounded-lg p-4 transition-all duration-300 hover:border-indigo-400/50 border border-transparent">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleStep(index)}>
                                        <h3 className="font-semibold text-lg text-white">{step.stage}</h3>
                                        <div className="flex items-center gap-4">
                                            {step.durationMs != null && <span className="text-sm text-white font-mono">{step.durationMs}ms</span>}
                                            <span className={`transform transition-transform text-2xl text-white ${openStepIndex === index ? 'rotate-180' : ''}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </span>
                                        </div>
                                    </div>

                                    {openStepIndex === index && (
                                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fade-in-up">
                                            <div>
                                                <h4 className="font-semibold text-cyan-400 mb-2">Input</h4>
                                                <CodeBlock data={step.input} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-cyan-400 mb-2">Output</h4>
                                                <CodeBlock data={step.output} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};