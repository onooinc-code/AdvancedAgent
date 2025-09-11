import React from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Spinner } from './Spinner.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

export const LiveStatusIndicator: React.FC = () => {
    const { loadingStage, getAgent } = useAppContext();

    if (loadingStage.stage === 'idle') {
        return null;
    }
    
    let text = '';
    switch (loadingStage.stage) {
        case 'deciding':
            text = 'Manager is deciding who should speak next...';
            break;
        case 'generating':
            const agentNameGen = getAgent(loadingStage.agentId || '')?.name || 'Agent';
            text = `${safeRender(agentNameGen)} is generating a response...`;
            break;
        case 'suggesting':
            text = 'Manager is generating suggestions...';
            break;
        case 'moderating':
            text = 'Manager is moderating the conversation...';
            break;
        case 'planning':
            text = 'Manager is formulating a plan...';
            break;
        case 'executing_plan':
            const agentNameExec = getAgent(loadingStage.agentId)?.name || 'Agent';
            text = `${safeRender(agentNameExec)} is executing: "${safeRender(loadingStage.task)}" (${loadingStage.current}/${loadingStage.total})...`;
            break;
        default:
            return null;
    }

    return (
        <div className="flex justify-center items-center gap-2 p-2 bg-gray-900 border-t border-gray-700 text-sm text-gray-400">
            <Spinner />
            <p>{text}</p>
        </div>
    );
};