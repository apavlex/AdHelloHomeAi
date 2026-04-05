import React from 'react';
import { Smile } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function Logo({ variant = 'dark', className = "" }: LogoProps) {
  const logoSrc = variant === 'light' ? '/logo-dark.png' : '/logo-light.png';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoSrc} 
        alt="AdHello.ai" 
        className="h-8 md:h-10 w-auto object-contain transition-all hover:scale-105 active:scale-95"
      />
    </div>
  );
}

