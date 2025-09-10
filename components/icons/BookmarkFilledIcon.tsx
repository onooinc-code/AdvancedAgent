import React from 'react';

export const BookmarkFilledIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
    >
        <defs>
            <linearGradient id="grad-bookmark-body" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <filter id="shadow-bookmark" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
            </filter>
        </defs>
        <g filter="url(#shadow-bookmark)">
            <path d="M12 8 H 52 C 54.209 8 56 9.791 56 12 V 56 L 32 44 L 8 56 V 12 C 8 9.791 9.791 8 12 8 Z" fill="url(#grad-bookmark-body)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M48 14 C 42,10 22,10 16,14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none" />
        </g>
    </svg>
);
