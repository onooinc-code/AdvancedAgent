import React from 'react';
import { CpuIcon, UsersIcon } from './Icons.tsx';

interface AvatarProps {
    name: string;
    color: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, color }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    const renderContent = () => {
        if (name === 'You') {
            return <UsersIcon className="h-6 w-6 text-white" />;
        }
        if (name === 'Manager Insight' || name === 'System') {
            return <CpuIcon className="h-6 w-6 text-yellow-300" />;
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