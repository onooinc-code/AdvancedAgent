
import React from 'react';

export const SitemapIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="16" width="6" height="6" rx="1"/>
        <rect x="9" y="2" width="6" height="6" rx="1"/>
        <rect x="16" y="16" width="6" height="6" rx="1"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V8"/>
    </svg>
);
