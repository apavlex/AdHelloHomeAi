import React from 'react';
import { Smile } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function Logo({ variant = 'dark', className = "" }: LogoProps) {
  const logoSrc = variant === 'light' ? '/logo-light.png' : '/logo-dark.png';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoSrc} 
        alt="AdHello.ai" 
        className="h-10 md:h-14 w-auto object-contain transition-transform hover:scale-105"
        onError={(e) => {
          // Fallback if specific variants are missing
          e.currentTarget.src = '/logo.png';
        }}
      />
    </div>
  );
}

