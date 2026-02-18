// "use client";

// import { useEffect, useState } from "react";
// import Container from "@/components/Container";
// import ProductCard from "@/components/ProductCard";
// import FilterBar from "@/components/FilterBar";
// import { supabaseBrowser } from "@/lib/supabase/browser";

// type DbProduct = {
//   id: string; // UUID
//   name: string;
//   description: string;
//   price_cents: number;
//   category: string;
//   stock: number;
//   rating: number;
// };

// type ImgRow = { product_id: string; image_url: string };

// export default function ProductsPage() {
//   const supabase = supabaseBrowser();

//   const [loading, setLoading] = useState(true);
//   const [products, setProducts] = useState<DbProduct[]>([]);
//   const [imagesByProduct, setImagesByProduct] = useState<Record<string, string>>({});

//   useEffect(() => {
//     const run = async () => {
//       setLoading(true);

//       const { data: p, error: pErr } = await supabase
//         .from("products")
//         .select("id,name,description,price_cents,category,stock,rating")
//         .eq("active", true)
//         .order("created_at", { ascending: false });

//       if (pErr) {
//         console.error(pErr);
//         setProducts([]);
//         setLoading(false);
//         return;
//       }

//       const rows = (p as any as DbProduct[]) ?? [];
//       setProducts(rows);

//       if (rows.length) {
//         const ids = rows.map((x) => x.id);

//         const { data: imgs } = await supabase
//           .from("product_images")
//           .select("product_id,image_url")
//           .in("product_id", ids)
//           .order("sort_order", { ascending: true });

//         const map: Record<string, string> = {};
//         (imgs as any as ImgRow[] | null)?.forEach((r) => {
//           if (!map[r.product_id]) map[r.product_id] = r.image_url;
//         });
//         setImagesByProduct(map);
//       } else {
//         setImagesByProduct({});
//       }

//       setLoading(false);
//     };

//     run();
//   }, [supabase]);

//   return (
//     <main className="py-10">
//       <Container>
//         <div className="flex items-end justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
//             <p className="mt-1 text-sm text-gray-200">Browse our catalog.</p>
//           </div>
//           <p className="text-sm text-gray-300">
//             Showing <span className="font-medium text-gray-300">{products.length}</span>
//           </p>
//         </div>

//         <FilterBar />

//         {loading ? (
//           <p className="mt-6 text-sm text-gray-600">Loading…</p>
//         ) : (
//           <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {products.map((p) => (
//               <ProductCard
//                 key={p.id}
//                 product={{
//                   id: p.id, // ✅ UUID route
//                   name: p.name,
//                   description: p.description,
//                   price: p.price_cents,
//                   category: p.category as any,
//                   rating: Number(p.rating),
//                   stock: p.stock,
//                   image: imagesByProduct[p.id] ?? undefined,
//                 }}
//               />
//             ))}
//           </div>
//         )}
//       </Container>
//     </main>
//   );
// }



"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  const sp = useSearchParams();

  // IMPORTANT: stringify params so we can use it as a stable dependency
  const spString = useMemo(() => sp.toString(), [sp]);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [imagesByProduct, setImagesByProduct] = useState<Record<string, string>>({});

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      // Read filters from URL
      const q = (sp.get("q") ?? "").trim();
      const category = (sp.get("category") ?? "all").trim();
      const sort = (sp.get("sort") ?? "").trim();

      // Base query
      let query = supabase
        .from("products")
        .select("id,name,description,price_cents,category,stock,rating")
        .eq("active", true);

      // Category filter
      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      // Search filter (name OR description)
      if (q) {
        // Escape % and _ to avoid wildcard edge cases
        const safe = q.replace(/[%_]/g, "\\$&");
        query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
      }

      // Sorting
      if (sort === "price-asc") query = query.order("price_cents", { ascending: true });
      else if (sort === "price-desc") query = query.order("price_cents", { ascending: false });
      else if (sort === "rating") query = query.order("rating", { ascending: false });
      else query = query.order("created_at", { ascending: false }); // default

      const { data: p, error: pErr } = await query;

      if (pErr) {
        console.error(pErr);
        setProducts([]);
        setImagesByProduct({});
        setLoading(false);
        return;
      }

      const rows = (p as any as DbProduct[]) ?? [];
      setProducts(rows);

      // Load images for visible products
      if (rows.length) {
        const ids = rows.map((x) => x.id);
        const { data: imgs, error: imgErr } = await supabase
          .from("product_images")
          .select("product_id,image_url")
          .in("product_id", ids)
          .order("sort_order", { ascending: true });

        if (imgErr) {
          console.error(imgErr);
          setImagesByProduct({});
        } else {
          const map: Record<string, string> = {};
          (imgs as any as ImgRow[] | null)?.forEach((r) => {
            if (!map[r.product_id]) map[r.product_id] = r.image_url;
          });
          setImagesByProduct(map);
        }
      } else {
        setImagesByProduct({});
      }

      setLoading(false);
    };

    run();
  }, [supabase, spString]); // ✅ rerun when URL filters change

  return (
    <main className="py-10">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
            <p className="mt-1 text-sm text-gray-400">Browse our catalog.</p>
          </div>

          <p className="text-sm text-gray-300">
            Showing <span className="font-medium text-gray-300">{products.length}</span>
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
                  id: p.id,
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