import React from 'react';

export const Logo = ({ size = 40, className = "" }: { size?: number, className?: string }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background shape */}
      <rect width="100" height="100" rx="24" fill="url(#logo-grad)" />
      
      {/* M shape */}
      <path 
        d="M25 65V35L40 50L50 40L60 50L75 35V65" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Heart pulse line inside bottom of M */}
      <path 
        d="M35 65H42L45 58L50 72L55 65H65" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="animate-pulse"
      />

      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
      </defs>
    </svg>
  );
};
