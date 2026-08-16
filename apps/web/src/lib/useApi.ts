"use client";

import { useState, useEffect, useRef } from 'react';

// Central API URL config (now relative because of Next.js rewrites)
export const API_BASE_URL = '/api/v1';

// ─────────────────────────────────────────────────────
// In-memory SWR cache: { url → { data, timestamp } }
// ─────────────────────────────────────────────────────
const swrCache = new Map<string, { data: any; ts: number }>();
// In-flight deduplication: prevents 2 components from firing the same request simultaneously
const inFlight = new Map<string, Promise<any>>();

// How long (ms) to consider cached data still "fresh" — revalidation fires in background after this
const STALE_TTL = 30_000; // 30 seconds

async function apiFetch(url: string): Promise<any> {
  // Deduplicate concurrent identical requests
  if (inFlight.has(url)) return inFlight.get(url)!;

  const headers: Record<string, string> = {};
  const promise = fetch(url, {
    credentials: 'include',
    headers,
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorBody;
        try { errorBody = await res.json(); } catch {}
        throw new Error(errorBody?.message || errorBody?.error || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .finally(() => {
      inFlight.delete(url);
    });

  inFlight.set(url, promise);
  return promise;
}

export function useApi<T>(endpoint: string | null, options?: RequestInit) {
  const cacheKey = endpoint ? `${API_BASE_URL}${endpoint}` : null;
  const cached = cacheKey ? swrCache.get(cacheKey) : null;

  const [data, setData] = useState<T | null>(cached?.data ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(endpoint ? !cached : false);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);
  const isMutating = useRef(false);

  const mutate = () => {
    // Force a fresh fetch, bypass cache
    if (cacheKey) swrCache.delete(cacheKey);
    isMutating.current = true;
    setVersion(v => v + 1);
  };

  useEffect(() => {
    if (!endpoint || !cacheKey) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    let isMounted = true;

    const cached = swrCache.get(cacheKey);
    const isStale = !cached || (Date.now() - cached.ts > STALE_TTL);
    const isForcedMutate = isMutating.current;
    isMutating.current = false;

    // Serve stale data immediately while revalidating in background
    if (cached && !isForcedMutate) {
      setData(cached.data);
      setIsLoading(false);
      if (!isStale) return; // Data is fresh — no need to re-fetch
    }

    // Either data is missing, stale, or was forced — fetch fresh data
    setIsLoading(!cached); // Only show spinner if there's no stale data to show

    apiFetch(cacheKey)
      .then((result) => {
        swrCache.set(cacheKey, { data: result, ts: Date.now() });
        if (isMounted) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint, version]);

  return { data, isLoading, error, mutate };
}

// Utility for non-hook POST/PATCH/DELETE requests (no caching — always real-time)
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {})
  };

  let body = options?.body;

  if (options?.body || (options?.method && !['GET', 'DELETE'].includes(options.method.toUpperCase()))) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    if (!body && headers['Content-Type'] === 'application/json') {
      body = "{}";
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    body,
    credentials: 'include',
    headers
  });

  if (!response.ok) {
    let errorBody;
    try { errorBody = await response.json(); } catch {}

    if (response.status === 404 || response.status === 401) {
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


