"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type OrderStatus = "created" | "paid" | "packed" | "shipped" | "delivered";

type OrderRow = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  order_items?: {
    id: string;
    name: string;
    unit_price_cents: number;
    qty: number;
  }[];
};

function money(cents: number) {
  return `₹ ${(cents / 100).toFixed(2)}`;
}
function fmt(ts: string) {
  return new Date(ts).toLocaleString();
}

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  created: "paid",
  paid: "packed",
  packed: "shipped",
  shipped: "delivered",
  delivered: null,
};

export default function AdminOrdersPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);

    // AdminShell already checks role and session. This is just data load.
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,user_id,status,total_cents,created_at,
        order_items(id,name,unit_price_cents,qty)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setOrders([]);
    } else {
      setOrders((data as any) ?? []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    setErr(null);

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      setErr(error.message);
    } else {
      // Update local UI quickly
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }

    setUpdatingId(null);
  };

  const advance = async (o: OrderRow) => {
    const ns = nextStatus[o.status];
    if (!ns) return;
    await setStatus(o.id, ns);
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all customer orders and update fulfillment status.
          </p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card className="mt-6">
          <CardContent className="p-6 text-sm text-gray-600">Loading…</CardContent>
        </Card>
      ) : err ? (
        <Card className="mt-6">
          <CardHeader>
            <div className="text-base font-semibold">Error</div>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="whitespace-pre-wrap rounded border bg-gray-50 p-3 text-xs text-gray-800">
              {err}
            </pre>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="p-6 text-sm text-gray-600">No orders found.</CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 break-all">{o.id}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      {fmt(o.created_at)} • User:{" "}
                      <span className="break-all">{o.user_id}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Status: <span className="font-semibold">{o.status}</span>
                    </div>
                  </div>
                  <div className="shrink-0 font-semibold text-black">{money(o.total_cents)}</div>
                </div>

                {/* Items */}
                {o.order_items?.length ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                    <div className="font-semibold mb-2 text-black">Items</div>
                    <div className="space-y-1">
                      {o.order_items.map((it) => (
                        <div key={it.id} className="flex justify-between gap-3">
                          <div className="min-w-0 truncate text-black">
                            {it.name} × {it.qty}
                          </div>
                          <div className="shrink-0 text-black">
                            {money(it.unit_price_cents * it.qty)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Controls */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={updatingId === o.id || o.status === "delivered"}
                    onClick={() => setStatus(o.id, "packed")}
                  >
                    Mark Packed
                  </Button>

                  <Button
                    variant="secondary"
                    disabled={updatingId === o.id || o.status === "delivered"}
                    onClick={() => setStatus(o.id, "shipped")}
                  >
                    Mark Shipped
                  </Button>

                  <Button
                    variant="secondary"
                    disabled={updatingId === o.id || o.status === "delivered"}
                    onClick={() => setStatus(o.id, "delivered")}
                  >
                    Mark Delivered
                  </Button>

                  <Button
                    disabled={updatingId === o.id || nextStatus[o.status] === null}
                    onClick={() => advance(o)}
                  >
                    Advance Status
                  </Button>
                </div>

                {updatingId === o.id && (
                  <p className="text-xs text-gray-500">Updating status…</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}