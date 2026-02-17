"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
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

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productUuid = params.id;

  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("id,name,description,price_cents,category,stock,rating")
        .eq("id", productUuid)
        .single();

      if (pErr || !p) {
        setProduct(null);
        setImageUrl(null);
        setLoading(false);
        return;
      }

      setProduct(p as any);

      const { data: imgs } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productUuid)
        .order("sort_order", { ascending: true })
        .limit(1);

      setImageUrl(imgs?.[0]?.image_url ?? null);
      setLoading(false);
    };

    run();
  }, [productUuid, supabase]);

  if (loading) {
    return (
      <main className="py-10">
        <Container>
          <p className="text-sm text-gray-600">Loading product…</p>
        </Container>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="py-10">
        <Container>
          <p className="text-sm text-gray-600">Product not found.</p>
        </Container>
      </main>
    );
  }

  // Map DB product to your existing AddToCartButton Product type
  // NOTE: cart still stores id as UUID now, which is fine.
  const uiProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price_cents,
    category: product.category as any,
    rating: Number(product.rating),
    stock: product.stock,
    image: imageUrl ?? undefined,
  };

  return (
    <main className="py-10">
      <Container>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-200">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-10"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : null}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Badge>{product.category}</Badge>
                <span className="text-sm text-gray-600">★ {Number(product.rating).toFixed(1)}</span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{product.name}</h1>
              <p className="mt-3 text-gray-600">{product.description}</p>

              <div className="mt-6 text-2xl font-semibold">
                ₹ {(product.price_cents / 100).toFixed(2)}
              </div>

              <div className="mt-2 text-sm text-gray-600">Stock: {product.stock}</div>

              <div className="mt-6 space-y-3">
                <AddToCartButton product={uiProduct as any} />
                {/* ✅ pass UUID here */}
                <WishlistButton productUuid={product.id} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}