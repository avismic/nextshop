import { NextResponse } from "next/server";
import { queryProducts } from "@/lib/product-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") ?? "";
  const category = (searchParams.get("category") ?? "all") as any;
  const sort = (searchParams.get("sort") ?? "") as any;

  const result = queryProducts({ q, category, sort });

  return NextResponse.json({ products: result });
}