import React from 'react';
import { PlanStep } from '../types/index.ts';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { PlanIcon } from './Icons.tsx';
import { safeRender } from '../services/utils/safeRender.ts';

interface PlanDisplayProps {
    plan: PlanStep[];
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
    const { getAgent } = useAppContext();

    return (
        <div className="prose-agent">
            <div className="flex items-center gap-3 mb-3">
                <PlanIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-indigo-400 m-0">Manager's Plan</h3>
            </div>
            <p className="text-sm text-gray-500 mt-0 mb-4">The following steps will be executed to address your request:</p>
            <ol className="list-decimal pl-5 space-y-4">
                {plan.map((step, index) => {
                    const agent = getAgent(step.agentId);
                    return (
                        <li key={index} className="pl-2">
                           <div className="font-bold text-gray-800">
                                Step {index + 1}: {safeRender(agent?.name || step.agentId)}
                           </div>
                           <p className="my-1 text-gray-600"><span className="font-semibold">Task:</span> {safeRender(step.task)}</p>
                           {step.rationale && <p className="my-1 text-sm text-gray-500 italic"><span className="font-semibold not-italic">Rationale:</span> {safeRender(step.rationale)}</p>}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};