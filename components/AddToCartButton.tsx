"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

type Props = {
  product: Product;
  /** If true, shows +/- quantity selector */
  withQuantity?: boolean;
  /** Default quantity when clicking add (used if withQuantity=false) */
  defaultQty?: number;
};

export default function AddToCartButton({
  product,
  withQuantity = false,
  defaultQty = 1,
}: Props) {
  const add = useCart((s) => s.add);
  const cartItems = useCart((s) => s.items);

  // How many of this product is already in cart
  const inCartQty = useMemo(() => {
    const item = cartItems.find((i) => i.id === product.id);
    return item?.qty ?? 0;
  }, [cartItems, product.id]);

  const maxAddable = Math.max(0, product.stock - inCartQty);

  const [qty, setQty] = useState(() => {
    const initial = withQuantity ? 1 : defaultQty;
    return clamp(initial, 1, Math.max(1, maxAddable || 1));
  });

  const [added, setAdded] = useState(false);

  const disabled = product.stock <= 0 || maxAddable <= 0;

  const handleAdd = () => {
    if (disabled) return;

    const finalQty = withQuantity ? qty : defaultQty;
    const safeQty = clamp(finalQty, 1, maxAddable || 1);

    add(product, safeQty);

    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);

    // After add, if withQuantity, reset back to 1 (optional)
    if (withQuantity) setQty(1);
  };

  return (
    <div className="space-y-3">
      {withQuantity && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-600">Quantity</span>

          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              className="h-9 w-9 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setQty((q) => clamp(q - 1, 1, Math.max(1, maxAddable || 1)))}
              disabled={disabled || qty <= 1}
              aria-label="Decrease quantity"
            >
              –
            </button>

            <div className="grid h-9 w-12 place-items-center text-sm font-medium">
              {qty}
            </div>

            <button
              type="button"
              className="h-9 w-9 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setQty((q) => clamp(q + 1, 1, Math.max(1, maxAddable || 1)))}
              disabled={disabled || qty >= maxAddable}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleAdd}
        disabled={disabled}
        title={disabled ? "Out of stock or already at max in cart" : "Add to cart"}
      >
        {disabled ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
      </Button>

      {/* Helpful info line */}
      <p className="text-xs text-gray-500">
        {product.stock <= 0
          ? "Currently unavailable."
          : maxAddable <= 0
          ? "You already added the maximum available stock."
          : `In cart: ${inCartQty} • Available: ${product.stock}`}
      </p>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}