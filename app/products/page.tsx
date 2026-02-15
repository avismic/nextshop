import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import { queryProducts } from "@/lib/product-service";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string };
}) {
  const products = queryProducts({
    q: searchParams.q,
    category: (searchParams.category as any) ?? "all",
    sort: (searchParams.sort as any) ?? "",
  });

  return (
    <main className="py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-600">Browse and filter our catalog.</p>
        </div>
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{products.length}</span>
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