
import React from 'react';

interface ToggleSwitchProps {
    label: string;
    description?: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, onChange }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <label className="block font-medium text-gray-200">{label}</label>
                {description && <p className="text-sm text-gray-400 max-w-md">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex items-center h-7 w-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 ${
                    enabled ? 'bg-indigo-600' : 'bg-black/30'
                }`}
                role="switch"
                aria-checked={enabled}
            >
                <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
};