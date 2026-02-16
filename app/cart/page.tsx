"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function money(cents: number) {
  return `₹ ${(cents / 100).toFixed(2)}`;
}

export default function CartPage() {
  // Hydration guard (prevents “empty cart flash” / hydration mismatch issues)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  // Simple shipping rule for demo
  const shipping = items.length > 0 ? 199 : 0;
  const total = subtotal + shipping;

  const clearCartEverywhere = async () => {
    clear(); // clears Zustand + localStorage (persist)
    // Optional: explicitly delete HttpOnly cookie.
    // Not strictly required if CartCookieSyncer posts an empty snapshot,
    // but this is cleaner.
    try {
      await fetch("/api/cart", { method: "DELETE" });
    } catch {
      // ignore for demo
    }
  };

  if (!mounted) {
    return (
      <main className="py-10">
        <Container>
          <h1 className="text-2xl font-semibold tracking-tight">Your Cart</h1>
          <p className="mt-2 text-sm text-gray-600">Loading…</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your Cart</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review items and proceed to checkout.
            </p>
          </div>

          {items.length > 0 && (
            <Button variant="ghost" onClick={clearCartEverywhere}>
              Clear cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Your cart is empty.</p>
              <div className="mt-4">
                <Link href="/products">
                  <Button>Browse products</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Left: Items */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-gray-900">
                          {item.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {money(item.price)} each
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="text-sm text-gray-600">Qty</span>

                          <div className="flex items-center overflow-hidden rounded-lg border border-black bg-white">
                            <button
                              type="button"
                              className="h-9 w-9 hover:bg-gray-300 text-black"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              disabled={item.qty <= 1}
                              aria-label="Decrease quantity"
                            >
                              –
                            </button>

                            <div className="grid h-9 w-12 place-items-center text-sm text-black font-medium">
                              {item.qty}
                            </div>

                            <button
                              type="button"
                              className="h-9 w-9 hover:bg-gray-300 text-black"
                              onClick={() => setQty(item.id, item.qty + 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <Button variant="ghost" onClick={() => remove(item.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600">Line total</div>
                        <div className="text-base font-semibold text-gray-900">
                          {money(item.price * item.qty)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right: Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="text-base font-semibold text-black">Order Summary</div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {money(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900">
                      {money(shipping)}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex justify-between">
                    <span className="text-gray-700">Total</span>
                    <span className="text-base font-semibold text-gray-900">
                      {money(total)}
                    </span>
                  </div>

                  <div className="pt-3 space-y-2">
                    <Link href="/checkout">
                      <Button className="w-full">Proceed to Checkout</Button>
                    </Link>

                    <Link href="/products">
                      <Button variant="secondary" className="w-full">
                        Continue shopping
                      </Button>
                    </Link>
                  </div>

                  <p className="pt-2 text-xs text-gray-500">
                    Demo checkout (Stripe-ready later).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}