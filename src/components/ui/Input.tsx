import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none ring-0 transition focus:border-primary/60 ${className}`}
      {...props}
    />
  );
}
