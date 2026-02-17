"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";
import AccountShell from "@/components/account/AccountShell";

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
};

function money(cents: number) {
  return `₹ ${(cents / 100).toFixed(2)}`;
}
function fmt(ts: string) {
  return new Date(ts).toLocaleString();
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setErr(null);
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        router.replace("/auth/login");
        return;
      }

      setEmail(userRes.user.email ?? null);

      const { data, error } = await supabase
        .from("orders")
        .select("id,status,total_cents,created_at")
        .order("created_at", { ascending: false });

      if (error) setErr(error.message);
      setOrders((data as any) ?? []);
      setLoading(false);
    };

    run();
  }, [router, supabase]);

  return (
    <AccountShell>
    <main className="py-10">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
            <p className="mt-1 text-sm text-gray-600">
              {email ? `Signed in as ${email}` : "Checking session…"}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/auth/login");
            }}
          >
            Logout
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
            <CardContent className="p-6 text-sm text-gray-600">
              No orders yet.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-900">{o.id}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      {fmt(o.created_at)} • Status: {o.status}
                    </div>
                  </div>
                  <div className="shrink-0 font-semibold">{money(o.total_cents)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
    </AccountShell>
  );
}