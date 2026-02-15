import type { Product } from "./types";

export const products: Product[] = [
  {
    id: "p1",
    name: "Noise-Cancelling Headphones",
    description: "Comfortable fit, strong ANC, 30h battery life.",
    price: 12999,
    image: "/images/headphones.png",
    category: "electronics",
    rating: 4.6,
    stock: 10,
  },
  {
    id: "p2",
    name: "Minimal Backpack",
    description: "Water-resistant, laptop compartment, durable zips.",
    price: 4999,
    image: "/images/backpack.png",
    category: "fashion",
    rating: 4.3,
    stock: 18,
  },
  {
    id: "p3",
    name: "Ergonomic Desk Lamp",
    description: "Warm light, adjustable arm, minimal footprint.",
    price: 2599,
    image: "/images/lamp.png",
    category: "home",
    rating: 4.2,
    stock: 12,
  },
  {
    id: "p4",
    name: "Bestselling Novel",
    description: "A page-turner you won’t put down.",
    price: 899,
    image: "/images/book.png",
    category: "books",
    rating: 4.7,
    stock: 40,
  },
  // Add 4–8 more products similarly
];