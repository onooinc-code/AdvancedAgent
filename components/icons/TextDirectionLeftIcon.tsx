import React from 'react';

export const TextDirectionLeftIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h10M4 14h16M4 18h10" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19V5m18 14V5" transform="translate(0, -0.5) scale(0.8)" />
    </svg>
);
