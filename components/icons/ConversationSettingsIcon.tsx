import React from 'react';

export const ConversationSettingsIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
    >
        <defs>
            <linearGradient id="grad-conv-set-body" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
             <linearGradient id="grad-conv-set-center" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <filter id="shadow-conv-set" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
            </filter>
        </defs>
        <g filter="url(#shadow-conv-set)">
            <path d="M32 10 V 4 M47.3 16.7 L 51.5 12.5 M54 32 H 60 M47.3 47.3 L 51.5 51.5 M32 54 V 60 M16.7 47.3 L 12.5 51.5 M10 32 H 4 M16.7 16.7 L 12.5 12.5" stroke="url(#grad-conv-set-body)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="32" cy="32" r="18" fill="url(#grad-conv-set-center)" stroke="#FFFFFF" strokeWidth="4"/>
            <circle cx="32" cy="32" r="8" fill="#FFFFFF" opacity="0.8"/>
             <path d="M48 20 C 45,15 39,13 32,13 C 25,13 19,15 16,20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none" />
        </g>
    </svg>
);
