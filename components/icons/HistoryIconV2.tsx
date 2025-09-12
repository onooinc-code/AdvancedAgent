import React from 'react';

export const HistoryIconV2 = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <defs>
      <linearGradient id="grad-history-body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#D3D3D3', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#A9A9A9', stopOpacity: 1 }} />
      </linearGradient>
      <radialGradient id="grad-history-face" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: '#a0c4ff', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#6a8ecb', stopOpacity: 1 }} />
      </radialGradient>
      <filter id="shadow-history" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#shadow-history)">
      <circle cx="32" cy="32" r="26" fill="url(#grad-history-body)" stroke="#FFFFFF" strokeWidth="4"/>
      <circle cx="32" cy="32" r="20" fill="url(#grad-history-face)" stroke="#FFFFFF" strokeWidth="2"/>
      <path d="M32 18 V 32 L 44 38" stroke="#333333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M52 20 C 49,15 41,12 32,12 C 23,12 15,15 12,20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" fill="none"/>
    </g>
  </svg>
);