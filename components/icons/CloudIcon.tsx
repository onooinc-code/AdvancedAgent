import React from 'react';

export const CloudIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
    >
        <defs>
            <linearGradient id="grad-cloud-body" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="shadow-cloud" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
            </filter>
        </defs>
        <g filter="url(#shadow-cloud)">
            <path d="M44,24c3.3,0,6,2.7,6,6c0,3.3-2.7,6-6,6H20c-4.4,0-8-3.6-8-8c0-4.1,3.1-7.5,7.1-7.9 C20.1,20.5,24.7,16,30,16c4.9,0,9,3.6,9.8,8.3C41.2,24.1,42.6,24,44,24z" fill="url(#grad-cloud-body)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M46 22 C 43,19 37,17 30,17 C 23,17 17,19 14,22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none" />
        </g>
    </svg>
);
