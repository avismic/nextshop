"use client";

import { useEffect, useMemo, useState } from "react";
import AccountShell from "@/components/account/AccountShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";

type WishlistRow = { id: string; product_id: string; created_at: string };
type ProductRow = { id: string; name: string; price_cents: number; category: string };

function money(cents: number) {
  return `₹ ${(cents / 100).toFixed(2)}`;
}

export default function WishlistPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<WishlistRow[]>([]);
  const [products, setProducts] = useState<Record<string, ProductRow>>({});

  const productIds = useMemo(() => wishlist.map((w) => w.product_id), [wishlist]);

  const load = async () => {
    setErr(null);
    setLoading(true);

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      // AccountShell will redirect; just stop.
      setLoading(false);
      return;
    }

    const { data: w, error: wErr } = await supabase
      .from("wishlist_items")
      .select("id, product_id, created_at")
      .order("created_at", { ascending: false });

    if (wErr) {
      setErr(wErr.message);
      setLoading(false);
      return;
    }

    const wishlistRows = (w as any as WishlistRow[]) ?? [];
    setWishlist(wishlistRows);

    if (wishlistRows.length === 0) {
      setProducts({});
      setLoading(false);
      return;
    }

    const ids = wishlistRows.map((x) => x.product_id);
    const { data: p, error: pErr } = await supabase
      .from("products")
      .select("id, name, price_cents, category")
      .in("id", ids);

    if (pErr) {
      setErr(pErr.message);
      setLoading(false);
      return;
    }

    const map: Record<string, ProductRow> = {};
    (p as any as ProductRow[]).forEach((row) => (map[row.id] = row));
    setProducts(map);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (productId: string) => {
    await supabase.from("wishlist_items").delete().eq("product_id", productId);
    load();
  };

  return (
    <AccountShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-600">Saved items for later.</p>
        </div>
        <Button variant="secondary" onClick={() => (window.location.href = "/products")}>
          Browse products
        </Button>
      </div>

      {loading ? (
        <Card className="mt-6">
          <CardContent className="p-6 text-sm text-gray-600">Loading…</CardContent>
        </Card>
      ) : err ? (
        <Card className="mt-6">
          <CardHeader>
            <div className="font-semibold">Error</div>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap">{err}</pre>
          </CardContent>
        </Card>
      ) : wishlist.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="p-6 text-sm text-gray-600">
            No wishlist items yet.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4">
          {productIds.map((id) => {
            const p = products[id];
            if (!p) return null;

            return (
              <Card key={id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.category}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-black">{money(p.price_cents)}</div>
                    <Button variant="ghost" onClick={() => remove(id)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}