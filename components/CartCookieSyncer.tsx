"use client";

import { useEffect, useMemo, useRef } from "react";
import { useCart } from "@/store/cart";

export default function CartCookieSyncer() {
  // Subscribe to a stable state value (items array reference changes only when state changes)
  const items = useCart((s) => s.items);

  // Create a minimal snapshot (only what we store in cookie)
  const payload = useMemo(() => {
    const snapshot = items.map((i) => ({ id: i.id, qty: i.qty }));
    return JSON.stringify({ items: snapshot });
  }, [items]);

  const lastSent = useRef<string>("");

  useEffect(() => {
    // Avoid re-sending identical payload
    if (payload === lastSent.current) return;

    const t = setTimeout(async () => {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload,
        });
        lastSent.current = payload;
      } catch {
        // ignore failures for demo
      }
    }, 250);

    return () => clearTimeout(t);
  }, [payload]);

  return null;
}