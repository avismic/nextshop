import { products } from "./products";
import type { Category, Product } from "./types";

export type ProductQuery = {
  q?: string;
  category?: "all" | Category;
  sort?: "" | "price-asc" | "price-desc" | "rating";
};

export function queryProducts({ q, category = "all", sort = "" }: ProductQuery): Product[] {
  let result = products;

  if (q?.trim()) {
    const s = q.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(s));
  }

  if (category !== "all") {
    result = result.filter((p) => p.category === category);
  }

  if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
  if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);

  return result;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}