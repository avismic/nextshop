import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">
            {product.name}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge>{product.category}</Badge>
            <span className="text-xs text-gray-500">★ {product.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="shrink-0 text-sm font-semibold text-gray-900">
          ₹ {(product.price / 100).toFixed(2)}
        </div>
      </div>
    </Link>
  );
}