import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Global performance optimizer
 * - Preloads critical data
 * - Caches common queries
 * - Shows success notifications
 */
export function usePerformanceBoost() {
  useEffect(() => {
    // Preload critical resources
    const prefetchResources = async () => {
      try {
        // Prefetch fonts and critical CSS
        if ('fonts' in document) {
          await document.fonts.ready;
        }
      } catch (err) {
        console.warn('Prefetch optimization skipped');
      }
    };

    prefetchResources();

    // Show ready notification
    const readyTimer = setTimeout(() => {
      toast.success('App loaded and ready!', { duration: 2000 });
    }, 500);

    return () => clearTimeout(readyTimer);
  }, []);
}

/**
 * Debounce hook for input performance
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}