"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AdminNewProductPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price_cents: "",
    category: "electronics",
    stock: "10",
    rating: "4.2",
  });

  const [file, setFile] = useState<File | null>(null);

  const create = async () => {
    setErr(null);
    setOk(null);
    setLoading(true);

    const price = Number(form.price_cents);
    const stock = Number(form.stock);
    const rating = Number(form.rating);

    if (!form.name.trim() || !form.description.trim() || Number.isNaN(price)) {
      setErr("Please fill name, description, and a valid price (in cents).");
      setLoading(false);
      return;
    }

    // 1) Create product row
    const { data: created, error: pErr } = await supabase
      .from("products")
      .insert({
        name: form.name.trim(),
        description: form.description.trim(),
        price_cents: price,
        category: form.category,
        stock: Number.isNaN(stock) ? 0 : stock,
        rating: Number.isNaN(rating) ? 0 : rating,
        active: true,
      })
      .select("id")
      .single();

    if (pErr || !created) {
      setErr(pErr?.message ?? "Failed to create product.");
      setLoading(false);
      return;
    }

    const productId = created.id as string;

    // 2) Upload image (optional)
    if (file) {
      // store in bucket product-images/<productId>/<timestamp>-filename
      const path = `${productId}/${Date.now()}-${file.name}`;

      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });

      if (upErr) {
        setErr(`Image upload failed: ${upErr.message}`);
        setLoading(false);
        return;
      }

      // 3) Get public URL + save metadata in product_images
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const imageUrl = pub.publicUrl;

      const { error: imgErr } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: imageUrl,
        image_path: `product-images/${path}`,
        sort_order: 0,
      });

      if (imgErr) {
        setErr(`Saving image metadata failed: ${imgErr.message}`);
        setLoading(false);
        return;
      }
    }

    setOk(`Product created! UUID: ${productId}`);
    setLoading(false);

    // Redirect to admin list
    router.push("/admin/products");
  };

  return (
    <AdminShell>
      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-black">Add Product</div>
          <p className="text-sm text-gray-600">Create one product and optionally upload an image.</p>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-black">
          <div>
            <label className="text-sm text-gray-700">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="text-sm text-gray-700">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm text-gray-700">Price (cents)</label>
              <Input value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} />
            </div>

            <div className="text-gray-600">
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

            <div>
              <label className="text-sm text-gray-700">Stock</label>
              <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Rating</label>
              <Input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-gray-700">Image (optional)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {err && <p className="text-sm text-rose-600">{err}</p>}
          {ok && <p className="text-sm text-emerald-700">{ok}</p>}

          <Button onClick={create} disabled={loading}>
            {loading ? "Creating…" : "Create product"}
          </Button>
        </CardContent>
      </Card>
    </AdminShell>
  );
}