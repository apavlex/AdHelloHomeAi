import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  activeValue: string;
  onSelect: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
  return (
    <div data-value={value} className={className}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          activeValue: value,
          onSelect: onValueChange
        });
      })}
    </div>
  );
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`inline-flex rounded-xl border border-white/15 bg-white/5 p-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, activeValue, onSelect, children }: TabsTriggerProps) {
  const isActive = value === activeValue;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        isActive ? 'bg-white text-brand-dark' : 'text-white/70 hover:text-white'
      }`}
      type="button"
    >
      {children}
    </button>
  );
}
