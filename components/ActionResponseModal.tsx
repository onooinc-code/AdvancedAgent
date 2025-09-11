import React from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { CloseIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

export const ActionResponseModal: React.FC = () => {
    const { actionModalState, closeActionModal } = useAppContext();

    const { isOpen, title, content, actions } = actionModalState;

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay ${isOpen ? 'open' : ''}`} onClick={closeActionModal}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-content shadow-indigo-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">{safeRender(title)}</h2>
                    <button onClick={closeActionModal} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-white whitespace-pre-wrap">
                    {safeRender(content)}
                </div>
                {actions && actions.length > 0 && (
                    <div className="p-6 mt-auto border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
                        {actions.map((action, index) => (
                             <button 
                                key={index} 
                                onClick={action.onClick}
                                className={action.isSecondary
                                    ? "bg-black/20 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
                                    : "bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-all transform hover:scale-105 neon-glow-indigo"
                                }
                             >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};