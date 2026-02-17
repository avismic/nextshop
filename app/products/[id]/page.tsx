import { notFound } from "next/navigation";
import { getProductById } from "@/lib/product-service";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";

import Image from "next/image";


type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetail({ params }: PageProps) {
  const { id } = await params; // ✅ unwrap params Promise
  const product = getProductById(id);

  if (!product) return notFound();

  return (
    <main className="py-10">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">

          
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : null}
          </div>


          <div>
            <div className="flex items-center gap-2">
              <Badge>{product.category}</Badge>
              <span className="text-sm text-gray-600">
                ★ {product.rating.toFixed(1)}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-gray-600">{product.description}</p>

            <div className="mt-6 text-2xl font-semibold">
              ₹ {(product.price / 100).toFixed(2)}
            </div>

            <div className="mt-2 text-sm text-gray-600">
              Stock: {product.stock}
            </div>

            <div className="mt-6">
              <AddToCartButton product={product} />
              <WishlistButton productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}