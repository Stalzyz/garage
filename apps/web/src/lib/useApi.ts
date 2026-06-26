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
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          credentials: 'include', // Send cookies cross-origin
          headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {})
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
