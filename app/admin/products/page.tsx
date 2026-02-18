"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";

type DbProduct = {
  id: string;
  name: string;
  price_cents: number;
  category: string;
  stock: number;
  active: boolean;
};

function money(cents: number) {
  return `₹ ${(cents / 100).toFixed(2)}`;
}

export default function AdminProductsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DbProduct[]>([]);
  const [err, setErr] = useState<string | null>(null);

  

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("id,name,price_cents,category,stock,active")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setItems([]);
    } else {
      setItems((data as DbProduct[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-400">Manage products in the database.</p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/products/new">
            <Button>Add product</Button>
          </Link>
          <Link href="/admin/products/import">
            <Button variant="secondary">CSV import</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Loading…</p>
      ) : err ? (
        <pre className="mt-6 whitespace-pre-wrap rounded border bg-red-50 p-4 text-xs text-red-800">
          {err}
        </pre>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-gray-900">{p.name}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {p.category} • Stock: {p.stock} • {p.active ? "Active" : "Inactive"}
                  </div>
                  <div className="mt-1 break-all text-xs text-gray-500">UUID: {p.id}</div>
                </div>
                <div className="shrink-0 font-semibold text-black">{money(p.price_cents)}</div>
              </CardContent>

                <div className="flex items-center gap-2">
                <Link href={`/admin/products/${p.id}/edit`}>
                    <Button variant="ghost" size="sm" className="font-bold text-blue-600 hover:text-blue-700">Edit</Button>
                </Link>
                
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                    const ok = confirm(`Disable "${p.name}"? (It will disappear from storefront)`);
                    if (!ok) return;
                    const { error } = await supabase.from("products").update({ active: false }).eq("id", p.id);
                    if (error) alert(error.message);
                    else load();
                    const { data: u } = await supabase.auth.getUser();
                    const { data: s } = await supabase.auth.getSession();
                    console.log("user:", u.user?.id, "session:", Boolean(s.session));
                    }}
                >
                    Disable
                </Button>
                </div>
            </Card>
          ))}

          {items.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-gray-600">No products found.</CardContent>
            </Card>
          )}
        </div>
      )}
    </AdminShell>
  );
}