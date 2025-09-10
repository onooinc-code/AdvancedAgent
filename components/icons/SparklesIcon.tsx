import React from 'react';

export const SparklesIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
    >
        <defs>
            <linearGradient id="grad-sparkle-body" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <filter id="shadow-sparkle" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
            </filter>
        </defs>
        <g filter="url(#shadow-sparkle)">
            <path d="M32 4 L38 26 L60 32 L38 38 L32 60 L26 38 L4 32 L26 26 Z" fill="url(#grad-sparkle-body)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M48 10 C 45,8 39,6 32,6 C 25,6 19,8 16,10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none" />
        </g>
    </svg>
);
