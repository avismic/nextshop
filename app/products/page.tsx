"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import FilterBar from "@/components/FilterBar";
import { supabaseBrowser } from "@/lib/supabase/browser";

type DbProduct = {
  id: string; // UUID
  name: string;
  description: string;
  price_cents: number;
  category: string;
  stock: number;
  rating: number;
};

type ImgRow = { product_id: string; image_url: string };

export default function ProductsPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [imagesByProduct, setImagesByProduct] = useState<Record<string, string>>({});

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("id,name,description,price_cents,category,stock,rating")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (pErr) {
        console.error(pErr);
        setProducts([]);
        setLoading(false);
        return;
      }

      const rows = (p as any as DbProduct[]) ?? [];
      setProducts(rows);

      if (rows.length) {
        const ids = rows.map((x) => x.id);

        const { data: imgs } = await supabase
          .from("product_images")
          .select("product_id,image_url")
          .in("product_id", ids)
          .order("sort_order", { ascending: true });

        const map: Record<string, string> = {};
        (imgs as any as ImgRow[] | null)?.forEach((r) => {
          if (!map[r.product_id]) map[r.product_id] = r.image_url;
        });
        setImagesByProduct(map);
      } else {
        setImagesByProduct({});
      }

      setLoading(false);
    };

    run();
  }, [supabase]);

  return (
    <main className="py-10">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
            <p className="mt-1 text-sm text-gray-600">Browse our catalog.</p>
          </div>
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{products.length}</span>
          </p>
        </div>

        <FilterBar />

        {loading ? (
          <p className="mt-6 text-sm text-gray-600">Loading…</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id, // ✅ UUID route
                  name: p.name,
                  description: p.description,
                  price: p.price_cents,
                  category: p.category as any,
                  rating: Number(p.rating),
                  stock: p.stock,
                  image: imagesByProduct[p.id] ?? undefined,
                }}
              />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}