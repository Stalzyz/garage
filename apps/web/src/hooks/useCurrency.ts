"use client";

import { useState, useEffect } from "react";

let cachedSymbol: string | null = null;
let isFetching = false;
const subscribers: Array<(s: string) => void> = [];

/**
 * Fetches the organisation's currency symbol from the API.
 * Caches the result in module scope to avoid redundant requests.
 * Falls back to "₹" if the API is unavailable.
 */
export function useCurrency() {
  const [symbol, setSymbol] = useState<string>(cachedSymbol ?? "₹");

  useEffect(() => {
    if (cachedSymbol) {
      setSymbol(cachedSymbol);
      return;
    }

    // Subscribe for when the fetch resolves
    subscribers.push(setSymbol);

    if (!isFetching) {
      isFetching = true;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      fetch(`${apiBase}/settings/finance`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          const sym: string = data?.currencySymbol || "₹";
          cachedSymbol = sym;
          subscribers.forEach((cb) => cb(sym));
          subscribers.length = 0;
        })
        .catch(() => {
          // Fallback
          cachedSymbol = "₹";
          subscribers.forEach((cb) => cb("₹"));
          subscribers.length = 0;
        })
        .finally(() => {
          isFetching = false;
        });
    }
  }, []);

  /**
   * Format a number as a currency string: symbol + formatted number
   * e.g.  formatCurrency(12500) → "₹12,500"
   */
  function formatCurrency(amount: number, compact = false): string {
    if (compact && amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}k`;
    }
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  }

  return { symbol, formatCurrency };
}
