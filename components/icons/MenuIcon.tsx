import React from 'react';

export const MenuIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <defs>
      <linearGradient id="grad-menu1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="grad-menu2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
      <linearGradient id="grad-menu3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="shadow-menu" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#shadow-menu)">
      <rect x="8" y="12" width="48" height="10" rx="5" fill="url(#grad-menu1)" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M12 15 C 20,10 44,10 52,15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
      
      <rect x="8" y="27" width="48" height="10" rx="5" fill="url(#grad-menu2)" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M12 30 C 20,25 44,25 52,30" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
      
      <rect x="8" y="42" width="48" height="10" rx="5" fill="url(#grad-menu3)" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M12 45 C 20,40 44,40 52,45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
    </g>
  </svg>
);