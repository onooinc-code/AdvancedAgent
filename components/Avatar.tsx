import React from 'react';
import { CpuChipIcon } from './Icons.tsx';

interface AvatarProps {
    name: string;
    color: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, color }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    const renderContent = () => {
        if (name === 'You') {
            return (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            );
        }
        if (name === 'Manager Insight') {
            return <CpuChipIcon className="h-6 w-6 text-yellow-300" />;
        }
        return initial;
    };

    return (
        <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0 shadow-md border-2 border-white/20 ${color}`}
            title={name}
        >
            {renderContent()}
        </div>
    );
};