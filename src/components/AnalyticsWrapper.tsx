import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * AnalyticsWrapper
 * 
 * Simple wrapper component that calls the useAnalytics hook on every route change.
 * This ensures that even standalone pages (not rendering App.tsx) are tracked accurately.
 */
export const AnalyticsWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useAnalytics();
  return <>{children || <Outlet />}</>;
};
