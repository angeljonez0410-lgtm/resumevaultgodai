import { useState, useEffect, useRef } from 'react';

/**
 * Stale-While-Revalidate Pattern Hook
 * Loads from localStorage instantly (<500ms), refreshes in background
 */
export function useStaleWhileRevalidate(key, fetchFn, options = {}) {
  const { ttl = 5 * 60 * 1000 } = options;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  // Store fetchFn in ref so it doesn't trigger re-runs
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;
  const lastFetchRef = useRef(0);

  useEffect(() => {
    // Only run once per key mount, respect TTL
    const now = Date.now();
    if (now - lastFetchRef.current < ttl) return;

    // 1. Try to load from cache instantly
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setIsStale(true);
        setIsLoading(false);
      } catch (e) { /* ignore */ }
    }

    // 2. Fetch fresh data in background (only once)
    lastFetchRef.current = now;
    const fetchFresh = async () => {
      try {
        const fresh = await fetchRef.current();
        localStorage.setItem(key, JSON.stringify(fresh));
        setData(fresh);
        setIsStale(false);
      } catch (error) {
        // Keep stale data on error — don't log 429s as errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchFresh();
  }, [key]); // key only — fetchFn changes every render

  return { data, isLoading, isStale };
}

/**
 * Set cache with TTL
 */
export function setCacheWithTTL(key, value, ttlMinutes = 10) {
  const expires = Date.now() + ttlMinutes * 60 * 1000;
  localStorage.setItem(key, JSON.stringify({ value, expires }));
}

/**
 * Get cache respecting TTL
 */
export function getCacheWithTTL(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  try {
    const { value, expires } = JSON.parse(cached);
    if (Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch (e) {
    return null;
  }
}