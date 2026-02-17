import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { products as mockProducts } from "@/lib/products"; // your existing mock list

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

// helper: construct public URL for a public bucket object
function publicBucketUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
}

export async function POST(req: Request) {
  // OPTIONAL: simple protection so random people can't seed your DB
  // Add a secret token env var and require it in header:
  // if (req.headers.get("x-seed-key") !== process.env.SEED_KEY) return NextResponse.json({error:"unauthorized"},{status:401});

  const results: any[] = [];

  for (const p of mockProducts) {
    // Map your mock image path "/images/headphones.png" -> "product-images/headphones.png"
    const filename = (p.image ?? "").split("/").pop() || "";
    const imagePath = `product-images/${filename}`;
    const imageUrl = filename ? publicBucketUrl(imagePath) : null;

    // Upsert product (use legacy_id to keep p1/p2 stable)
    const { data: upserted, error: upsertErr } = await supabaseAdmin
      .from("products")
      .upsert(
        {
          legacy_id: p.id, // p1/p2...
          name: p.name,
          description: p.description,
          price_cents: p.price,
          category: p.category,
          stock: p.stock,
          rating: p.rating,
          active: true,
        },
        { onConflict: "legacy_id" }
      )
      .select("id, legacy_id")
      .single();

    if (upsertErr) {
      results.push({ legacy_id: p.id, ok: false, step: "products", error: upsertErr.message });
      continue;
    }

    // Insert/Upsert image row if we have a filename
    if (imageUrl) {
      const { error: imgErr } = await supabaseAdmin
        .from("product_images")
        .upsert(
          {
            product_id: upserted.id,
            image_url: imageUrl,
            image_path: imagePath,
            sort_order: 0,
          },
          { onConflict: "product_id,image_path" as any } // if you add a unique constraint (recommended), see below
        );

      if (imgErr) {
        results.push({ legacy_id: p.id, ok: false, step: "product_images", error: imgErr.message });
        continue;
      }
    }

    results.push({ legacy_id: p.id, ok: true, product_uuid: upserted.id });
  }

  return NextResponse.json({ ok: true, results });
}