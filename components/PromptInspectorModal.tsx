import React from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Message } from '../types/index.ts';
import { CloseIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

const CodeBlock: React.FC<{ data: any; lang?: string }> = ({ data, lang = 'json' }) => {
    let content;
    if (typeof data === 'string') {
        content = data;
    } else {
        try {
            content = JSON.stringify(data, null, 2);
        } catch {
            content = String(data);
        }
    }

    return (
        <pre className="bg-black/30 text-sm text-cyan-300 p-3 rounded-md max-h-80 overflow-y-auto font-mono">
            <code className={`language-${lang}`}>{content}</code>
        </pre>
    );
};


export const PromptInspectorModal: React.FC = () => {
    const { promptInspectorData, isPromptInspectorOpen, closePromptInspectorModal, getAgent } = useAppContext();

    if (!isPromptInspectorOpen || !promptInspectorData) return null;

    const agent = getAgent(promptInspectorData.sender);
    const pipeline = promptInspectorData.pipeline || [];

    // Attempt to find the relevant prompt and response from the pipeline
    const modelInvocationStep = pipeline.find(step => step.stage.includes('Model Invocation'));
    const contextAssemblyStep = pipeline.find(step => step.stage.includes('Context Assembly'));

    const fullPrompt = modelInvocationStep?.input ?? contextAssemblyStep?.output ?? "Prompt data not available.";
    const rawResponse = modelInvocationStep?.output ?? "Response data not available.";

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay open`} onClick={closePromptInspectorModal}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content shadow-cyan-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <div>
                         <h2 className="text-2xl font-bold text-white">Prompt & Response Inspector</h2>
                         <p className="text-sm text-white">For message to <span className="font-semibold text-cyan-300">{safeRender(agent?.name || 'Agent')}</span></p>
                    </div>
                    <button onClick={closePromptInspectorModal} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">Full Prompt Sent to Model</h3>
                        <CodeBlock data={fullPrompt} />
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">Raw Response from Model</h3>
                        <CodeBlock data={rawResponse} />
                    </div>
                </div>
            </div>
        </div>
    );
};
