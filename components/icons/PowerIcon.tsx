import React from 'react';

export const PowerIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
    >
        <defs>
            <linearGradient id="grad-power-body" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="shadow-power" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
            </filter>
        </defs>
        <g filter="url(#shadow-power)">
            <circle cx="32" cy="32" r="26" fill="url(#grad-power-body)" stroke="#FFFFFF" strokeWidth="4"/>
            <path d="M32 16 V 32" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round"/>
            <path d="M44 24 C 42.343 17.657 37.657 13 32 13 C 26.343 13 21.657 17.657 20 24" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M52 22 C 49,17 41,14 32,14 C 23,14 15,17 12,22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none"/>
        </g>
    </svg>
);
