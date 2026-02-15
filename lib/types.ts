export type Category = "electronics" | "fashion" | "books" | "home";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  image?: string; // optional for now
  category: Category;
  rating: number; // 0-5
  stock: number;
};