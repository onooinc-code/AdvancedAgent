import React from 'react';

export const CheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <defs>
      <linearGradient id="grad-check-body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#16a34a" />
      </linearGradient>
      <filter id="shadow-check" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#shadow-check)">
      <circle cx="32" cy="32" r="26" fill="url(#grad-check-body)" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M20 32 L28 40 L44 24" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M52 22 C 49,17 41,14 32,14 C 23,14 15,17 12,22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none"/>
    </g>
  </svg>
);
