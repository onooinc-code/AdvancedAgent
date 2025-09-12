import React from 'react';

export const EditIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <defs>
      <linearGradient id="grad-edit-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#D3D3D3', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#A9A9A9', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="grad-edit-tip" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#6b7280', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1f2937', stopOpacity: 1 }} />
      </linearGradient>
       <linearGradient id="grad-edit-wood" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fde047', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow-edit" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#shadow-edit)" transform="rotate(45 32 32)">
        <path d="M28 10 L36 10 L36 45 L32 54 L28 45 Z" fill="url(#grad-edit-body)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
        <path d="M28 10 L32 4 L36 10 Z" fill="url(#grad-edit-wood)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
        <path d="M32 54 L30 58 L34 58 Z" fill="url(#grad-edit-tip)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
        <path d="M29 12 C 29 8, 35 8, 35 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" fill="none" />
    </g>
  </svg>
);