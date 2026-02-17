"use client";

import Link from "next/link";
import Container from "./Container";
import { useCart } from "@/store/cart";
// later we'll connect to cart store
// import { useCart } from "@/store/cart";

export default function Navbar() {
  // const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const count = useCart((s) => s.count());

  return (
    <header className="sticky top-0 z-50 border-b bg-black/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              N
            </span>
            <span>NextShop</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-white-700">
            <Link href="/products" className="hover:text-white-900">Products</Link>
            <Link href="/account/orders" className="hover:text-white-900">Orders</Link>
            <Link href="/cart" className="relative hover:text-white-900">
              Cart
              {count > 0 && (
                <span className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}