"use client";

import { useState, useEffect } from 'react';

// Central API URL config (now relative because of Next.js rewrites)
export const API_BASE_URL = '/api/v1';

export function useApi<T>(endpoint: string | null, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(endpoint ? true : false);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const mutate = () => setVersion(v => v + 1);

  useEffect(() => {
    if (!endpoint) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const url = `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
        const headers: Record<string, string> = {
          ...(options?.headers as Record<string, string> || {})
        };
        
        if (options?.body || (options?.method && !['GET', 'DELETE'].includes(options.method.toUpperCase()))) {
          headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }

        const response = await fetch(url, {
          ...options,
          credentials: 'include', // Send cookies cross-origin
          cache: 'no-store', // Prevent aggressive caching
          headers
        });
        
        if (!response.ok) {
          let errorBody;
          try { errorBody = await response.json(); } catch {}
          
          if (response.status === 404 || response.status === 401) {
             throw new Error(errorBody?.message || errorBody?.error || `Error ${response.status}: ${response.statusText}`);
          }
          throw new Error(errorBody?.message || errorBody?.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, version]);

  return { data, isLoading, error, mutate };
}

// Utility for non-hook POST/PATCH requests
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {})
  };
  
  if (options?.body || (options?.method && !['GET', 'DELETE'].includes(options.method.toUpperCase()))) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers
  });

  if (!response.ok) {
    let errorBody;
    try { errorBody = await response.json(); } catch {}

    if (response.status === 404 || response.status === 401) {
      // Don't throw for expected auth/missing endpoints to prevent Next.js dev overlay
      if (errorBody) return errorBody as unknown as T;
      return null as unknown as T;
    }
    throw new Error(errorBody?.message || errorBody?.error || `Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
