import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      {/* Smaller, consistent image frame */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-50 ring-1 ring-gray-200">
        <Image
          src={product.image ?? "/images/placeholder.png"}
          alt={product.name}
          fill
          priority
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          
          unoptimized={process.env.NODE_ENV === "development"}

        />
      </div>

      {/* Tighter content */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">
            {product.name}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Badge>{product.category}</Badge>
            <span className="text-xs text-gray-500">
              ★ {product.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-sm font-semibold text-gray-900">
          ₹ {(product.price / 100).toFixed(2)}
        </div>
        <WishlistButton productUuid={product.id} />
      </div>
    </Link>
  );
}