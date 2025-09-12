import React from 'react';

export const SettingsIconV2 = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <defs>
      <linearGradient id="grad-settings" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#c0c0c0', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#808080', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow-settings" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#shadow-settings)">
      <path d="M54.7,35.3l-5.3-3.1c-0.6-0.3-0.9-1-0.8-1.7l1-6.1c0.1-0.7,0.8-1.2,1.5-1.1l6,1.6 c1.2,0.3,1.9,1.6,1.4,2.7l-3,5.2C55.9,34.9,55.3,35.4,54.7,35.3z M32,4c1.4,0,2.5,1.1,2.5,2.5v6c0,1.4-1.1,2.5-2.5,2.5 S29.5,13.9,29.5,12.5v-6C29.5,5.1,30.6,4,32,4z M9.3,35.3l5.3-3.1c0.6-0.3,0.9-1,0.8-1.7l-1-6.1c-0.1-0.7-0.8-1.2-1.5-1.1l-6,1.6 c-1.2,0.3-1.9,1.6-1.4,2.7l3,5.2C8.1,34.9,8.7,35.4,9.3,35.3z M51.1,16.5l-4.5-4.5c-0.5-0.5-1.3-0.5-1.8,0l-4.2,4.2 c-0.5,0.5-0.5,1.3,0,1.8l4.5,4.5c0.5,0.5,1.3,0.5,1.8,0l4.2-4.2C51.6,17.8,51.6,17,51.1,16.5z M12.9,16.5l4.5-4.5 c0.5-0.5,1.3-0.5,1.8,0l4.2,4.2c0.5,0.5,0.5,1.3,0,1.8l-4.5,4.5c-0.5,0.5-1.3,0.5-1.8,0l-4.2-4.2C12.4,17.8,12.4,17,12.9,16.5z M19,47.5l-4.5,4.5c-0.5,0.5-0.5,1.3,0,1.8l4.2,4.2c0.5,0.5,1.3,0.5,1.8,0l4.5-4.5c0.5-0.5,0.5-1.3,0-1.8l-4.2-4.2 C20.3,47,19.5,47,19,47.5z M45,47.5l4.5,4.5c0.5,0.5,0.5,1.3,0,1.8l-4.2,4.2c-0.5,0.5-1.3,0.5-1.8,0l-4.5-4.5 c-0.5-0.5-0.5-1.3,0-1.8l4.2-4.2C43.7,47,44.5,47,45,47.5z M32,60c-1.4,0-2.5-1.1-2.5-2.5v-6c0-1.4,1.1-2.5,2.5-2.5 S34.5,50.1,34.5,51.5v6C34.5,58.9,33.4,60,32,60z" fill="url(#grad-settings)" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48.5,32c0,9.1-7.4,16.5-16.5,16.5S15.5,41.1,15.5,32S22.9,15.5,32,15.5S48.5,22.9,48.5,32z" fill="url(#grad-settings)" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M41,32c0,5-4,9-9,9s-9-4-9-9s4-9,9-9S41,27,41,32z" fill="#FFFFFF" opacity="0.8"/>
      <path d="M49,25C47.3,23,43.2,19,32,19S16.7,23,15,25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
    </g>
  </svg>
);