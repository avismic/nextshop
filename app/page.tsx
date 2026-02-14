import Link from "next/link";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="py-10">
      <Container>
        {/* HERO */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-600">
                New season • New arrivals
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                Discover products you’ll actually love.
              </h1>
              <p className="mt-4 text-base text-gray-600 md:text-lg">
                A clean Next.js e-commerce demo with fast browsing, a smooth cart,
                and a modular checkout (Stripe-ready later).
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/products">
                  <Button size="lg">Shop products</Button>
                </Link>
                <Link href="/products?sort=rating">
                  <Button size="lg" variant="secondary">Best rated</Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="rounded-full border px-3 py-1">Free returns</span>
                <span className="rounded-full border px-3 py-1">Fast shipping</span>
                <span className="rounded-full border px-3 py-1">Secure checkout</span>
              </div>
            </div>

            <div className="relative min-h-[240px] rounded-xl bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-emerald-500/15">
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur">
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="mt-2 text-xl font-semibold">Wireless Headphones</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Noise-cancelling • 30h battery
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Link href="/products/p1">
                      <Button size="sm">View</Button>
                    </Link>
                    <span className="text-sm font-semibold">₹ 129.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Shop by category</h2>
              <p className="mt-1 text-sm text-gray-600">
                Browse curated picks across popular categories.
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost">View all</Button>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Electronics", href: "/products?category=electronics" },
              { name: "Fashion", href: "/products?category=fashion" },
              { name: "Books", href: "/products?category=books" },
              { name: "Home", href: "/products?category=home" },
            ].map((c) => (
              <Card key={c.name} className="hover:shadow-md transition">
                <CardHeader>
                  <div className="text-base font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-600 mt-1">Explore trending picks</div>
                </CardHeader>
                <CardContent>
                  <Link href={c.href}>
                    <Button variant="secondary" className="w-full">Explore</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* TRUST ROW */}
        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            { title: "Fast delivery", desc: "Clear ETA and reliable shipping updates." },
            { title: "Easy returns", desc: "Hassle-free returns with simple steps." },
            { title: "Modular checkout", desc: "Mock now, Stripe-ready later." },
          ].map((x) => (
            <Card key={x.title}>
              <CardHeader>
                <div className="text-base font-semibold">{x.title}</div>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">{x.desc}</CardContent>
            </Card>
          ))}
        </section>
      </Container>
    </main>
  );
}