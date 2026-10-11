"use client";

/**
 * Cart state — React context + localStorage persistence.
 * Prices are always resolved from the catalog (never stored), so content
 * edits apply to existing carts.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { getSign } from "./catalog";

export interface CartItem {
  signId: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (signId: string, qty?: number) => void;
  remove: (signId: string) => void;
  setQty: (signId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "astralya-cart-v1";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    // Drop anything that no longer resolves to a real sign.
    return parsed.filter(
      (i) => getSign(i.signId) && Number.isInteger(i.qty) && i.qty > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy init from localStorage (client-only; load() guards for SSR).
  const [items, setItems] = useState<CartItem[]>(() => load());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable — cart still works for the session.
    }
  }, [items]);

  const add = useCallback((signId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.signId === signId);
      if (existing) {
        return prev.map((i) =>
          i.signId === signId ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
        );
      }
      return [...prev, { signId, qty: Math.min(qty, 99) }];
    });
  }, []);

  const remove = useCallback((signId: string) => {
    setItems((prev) => prev.filter((i) => i.signId !== signId));
  }, []);

  const setQty = useCallback((signId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.signId !== signId)
        : prev.map((i) => (i.signId === signId ? { ...i, qty } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      const sign = getSign(item.signId);
      if (!sign) continue;
      count += item.qty;
      subtotal += sign.price * item.qty;
    }
    return { count, subtotal };
  }, [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, add, remove, setQty, clear }),
    [items, count, subtotal, add, remove, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
