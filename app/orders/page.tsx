"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Container from "@/components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getOrders } from "@/lib/orders/storage";
import type { Order } from "@/lib/orders/types";

function money(cents: number) {
  return `₹ ${(cents / 100).toFixed(2)}`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const all = getOrders();
    setOrders(all);
    setSelectedId(all[0]?.id ?? null);
  }, []);

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  );

  if (!mounted) {
    return (
      <main className="py-10">
        <Container>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
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
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-gray-600">All your orders (latest first).</p>
          </div>
          <div className="flex gap-2">
            <Link href="/products">
              <Button>Continue shopping</Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary">View cart</Button>
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">No orders yet.</p>
              <div className="mt-4">
                <Link href="/products">
                  <Button>Browse products</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* LEFT: Orders list */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="text-base font-semibold text-black">Order history</div>
              </CardHeader>

              <CardContent className="p-2">
                <div className="space-y-2">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedId(o.id)}
                      className={[
                        "w-full rounded-lg border p-3 text-left transition",
                        o.id === selectedId
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-gray-200 bg-white hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {o.id}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {formatDate(o.createdAt)}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {o.items.length} item(s)
                          </div>
                        </div>
                        <div className="shrink-0 text-sm font-semibold text-gray-900">
                          {money(o.pricing.total)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* RIGHT: Selected order details */}
            <div className="lg:col-span-2 space-y-6">
              {!selected ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Select an order to view details.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Items */}
                  <Card>
                    <CardHeader>
                      <div className="text-base font-semibold text-black">Order details</div>
                      <div className="text-xs text-gray-600">
                        Placed on {formatDate(selected.createdAt)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {selected.items.map((i) => (
                        <div key={i.id} className="flex justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-gray-900">{i.name}</div>
                            <div className="text-xs text-gray-600">
                              {i.qty} × {money(i.unitPrice)}
                            </div>
                          </div>
                          <div className="shrink-0 font-medium text-gray-900">
                            {money(i.unitPrice * i.qty)}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Shipping */}
                  <Card>
                    <CardHeader>
                      <div className="text-base font-semibold text-black">Shipping</div>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-700 space-y-1">
                      <div className="font-medium text-gray-900">{selected.customer.name}</div>
                      <div>{selected.customer.email}</div>
                      <div className="pt-2">
                        {selected.address.line1}, {selected.address.city}, {selected.address.state}{" "}
                        {selected.address.pincode}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <div className="text-base font-semibold text-black">Payment & Total</div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900">
                          {money(selected.pricing.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span className="font-medium text-gray-900">
                          {money(selected.pricing.shipping)}
                        </span>
                      </div>
                      <div className="h-px bg-gray-100" />
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total</span>
                        <span className="text-base font-semibold text-gray-900">
                          {money(selected.pricing.total)}
                        </span>
                      </div>

                      <div className="pt-3 text-xs text-gray-600">
                        <div>Provider: {selected.payment.provider}</div>
                        <div>Payment ID: {selected.payment.paymentId}</div>
                        <div>Status: {selected.payment.status}</div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}