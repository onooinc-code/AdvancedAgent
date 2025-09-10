import React from 'react';

export const UsersIconV2 = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
    >
        <defs>
            <linearGradient id="grad-users-main" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="grad-users-secondary" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <filter id="shadow-users" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
            </filter>
        </defs>
        <g filter="url(#shadow-users)">
            <path d="M44 48 C44 42.477 39.523 38 34 38 L20 38 C14.477 38 10 42.477 10 48 L10 52 L44 52 L44 48 Z" fill="url(#grad-users-secondary)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="27" cy="27" r="11" fill="url(#grad-users-secondary)" stroke="#FFFFFF" strokeWidth="4"/>
            
            <path d="M54 50 C54 45.582 50.418 42 46 42 L38 42" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" fill="none" />
            <circle cx="42" cy="31" r="9" fill="url(#grad-users-main)" stroke="#FFFFFF" strokeWidth="4"/>

            <path d="M40 19 C 37,16 32,14 27,14 C 22,14 17,16 14,19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none" />
        </g>
    </svg>
);
