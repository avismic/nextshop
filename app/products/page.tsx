import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import { queryProducts, type ProductQuery } from "@/lib/product-service";

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams; // ✅ unwrap async searchParams (Next 15/16) [1](https://www.shadcnblocks.com/docs/blocks/getting-started)

  const products = queryProducts({
    q: sp.q,
    category: (sp.category ?? "all") as ProductQuery["category"],
    sort: (sp.sort ?? "") as ProductQuery["sort"],
  });

  return (
    <main className="py-10 mx-auto max-w-6xl px-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-350">Browse and filter our catalog.</p>
        </div>
        <p className="text-sm text-gray-400">
          Showing <span className="font-medium text-gray-400">{products.length}</span>
        </p>
      </div>

      <FilterBar />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-10 text-sm text-gray-600">
          No products found. Try changing filters or search.
        </p>
      )}
    </main>
  );
}