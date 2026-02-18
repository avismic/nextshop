"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import AdminShell from "@/components/admin/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/lib/supabase/browser";

type DbProduct = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  stock: number;
  rating: number;
  active: boolean;
};

type DbImage = {
  id: string;
  image_url: string;
  image_path: string; // e.g. product-images/<uuid>/<file>
};

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [image, setImage] = useState<DbImage | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_cents: "",
    category: "electronics",
    stock: "",
    rating: "",
    active: true,
  });

  const load = async () => {
    setErr(null);
    setLoading(true);

    const { data: p, error: pErr } = await supabase
      .from("products")
      .select("id,name,description,price_cents,category,stock,rating,active")
      .eq("id", productId)
      .single();

    if (pErr || !p) {
      setErr(pErr?.message ?? "Product not found.");
      setLoading(false);
      return;
    }

    setProduct(p as any);
    setForm({
      name: p.name,
      description: p.description,
      price_cents: String(p.price_cents),
      category: p.category,
      stock: String(p.stock),
      rating: String(p.rating),
      active: p.active,
    });

    const { data: imgs } = await supabase
      .from("product_images")
      .select("id,image_url,image_path")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1);

    setImage((imgs?.[0] as any) ?? null);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const save = async () => {
    if (!product) return;
    setErr(null);
    setSaving(true);

    const price = Number(form.price_cents);
    const stock = Number(form.stock);
    const rating = Number(form.rating);

    if (!form.name.trim() || !form.description.trim() || Number.isNaN(price)) {
      setErr("Name, description and price are required.");
      setSaving(false);
      return;
    }

    // 1) Update product row
    const { error: upErr } = await supabase
      .from("products")
      .update({
        name: form.name.trim(),
        description: form.description.trim(),
        price_cents: price,
        category: form.category,
        stock: Number.isNaN(stock) ? 0 : stock,
        rating: Number.isNaN(rating) ? 0 : rating,
        active: form.active,
      })
      .eq("id", productId);

    if (upErr) {
      setErr(upErr.message);
      setSaving(false);
      return;
    }

    // 2) If new image uploaded, upload to Storage + upsert product_images
    if (newFile) {
      const path = `${productId}/${Date.now()}-${newFile.name}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, newFile, { upsert: false });

      if (uploadErr) {
        setErr(`Image upload failed: ${uploadErr.message}`);
        setSaving(false);
        return;
      }

      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const imageUrl = pub.publicUrl;

      // Optional: delete previous image object from Storage to avoid junk
      // IMPORTANT: delete via Storage API (not SQL) and requires storage DELETE policy. [3](https://supabase.com/docs/guides/storage/management/delete-objects)[4](https://supabase.com/docs/guides/storage/security/access-control)
      if (image?.image_path) {
        const oldKey = image.image_path.replace(/^product-images\//, "");
        // ignore delete failures in demo
        await supabase.storage.from("product-images").remove([oldKey]);
      }

      // Upsert row in product_images
      if (image?.id) {
        await supabase.from("product_images").update({
          image_url: imageUrl,
          image_path: `product-images/${path}`,
        }).eq("id", image.id);
      } else {
        await supabase.from("product_images").insert({
          product_id: productId,
          image_url: imageUrl,
          image_path: `product-images/${path}`,
          sort_order: 0,
        });
      }
    }

    setSaving(false);
    router.push("/admin/products");
  };

  // Hard delete helper (optional)
  const hardDelete = async () => {
    if (!product) return;

    const ok = confirm(`Permanently delete "${product.name}"? This cannot be undone.`);
    if (!ok) return;

    // Delete storage image first (recommended), then DB rows.
    // Supabase says delete objects via Storage API remove(). [3](https://supabase.com/docs/guides/storage/management/delete-objects)[4](https://supabase.com/docs/guides/storage/security/access-control)
    if (image?.image_path) {
      const key = image.image_path.replace(/^product-images\//, "");
      await supabase.storage.from("product-images").remove([key]);
    }

    // Delete product_images row
    await supabase.from("product_images").delete().eq("product_id", productId);

    // Delete product row
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) alert(error.message);
    else router.push("/admin/products");
  };

  if (loading) {
    return (
      <AdminShell>
        <p className="text-sm text-gray-600">Loading…</p>
      </AdminShell>
    );
  }

  if (err) {
    return (
      <AdminShell>
        <pre className="whitespace-pre-wrap rounded border bg-red-50 p-4 text-xs text-red-800">
          {err}
        </pre>
      </AdminShell>
    );
  }

  if (!product) return null;

  return (
    <AdminShell>
      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-black">Edit Product</div>
          <p className="text-sm text-gray-600">Update details and optionally replace the image.</p>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {image?.image_url && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-50 ring-1 ring-gray-200">
              <Image
                src={image.image_url}
                alt={form.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={process.env.NODE_ENV === "development"}
              />
            </div>
          )}

          <div className="text-sm text-black">
            <label className="text-sm text-black">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="text-sm text-black">
            <label className="text-sm text-black">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-sm text-black">
            <div>
              <label className="text-sm text-gray-700">Price (cents)</label>
              <Input value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-gray-700">Category</label>
              <select
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="electronics">electronics</option>
                <option value="fashion">fashion</option>
                <option value="books">books</option>
                <option value="home">home</option>
              </select>
            </div>

            <div className="text-sm text-black">
              <label className="text-sm text-gray-700">Stock</label>
              <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-sm text-black">
            <div>
              <label className="text-sm text-gray-700">Rating</label>
              <Input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-gray-700">Replace image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Active</label>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
          </div>

          {err && (
            <pre className="whitespace-pre-wrap rounded border bg-red-50 p-3 text-xs text-red-800">
              {err}
            </pre>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>

            <Button variant="secondary" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>

            <Button variant="ghost" onClick={hardDelete}>
              Delete permanently
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}