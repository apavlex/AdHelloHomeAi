import React from 'react';

type ButtonVariant = 'default' | 'secondary' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-brand-dark hover:bg-primary-hover',
  secondary: 'bg-brand-dark text-white hover:bg-brand-dark/90',
  outline: 'border border-white/15 bg-transparent text-white hover:bg-white/10'
};

export function Button({ className = '', variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
