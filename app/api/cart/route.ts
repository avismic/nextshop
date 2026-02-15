import { NextResponse } from "next/server";

type CartSnapshot = {
  items: { id: string; qty: number }[];
  updatedAt: number;
};

export async function POST(req: Request) {
  const body = (await req.json()) as { items?: { id: string; qty: number }[] };

  const items = Array.isArray(body.items)
    ? body.items
        .filter((x) => x && typeof x.id === "string" && typeof x.qty === "number")
        .map((x) => ({ id: x.id, qty: Math.max(1, Math.floor(x.qty)) }))
    : [];

  const payload: CartSnapshot = {
    items,
    updatedAt: Date.now(),
  };

  // Encode JSON safely for cookie storage
  const value = encodeURIComponent(JSON.stringify(payload));

  const res = NextResponse.json({ ok: true });

  // Set HttpOnly cookie via response headers
  res.cookies.set("cart", value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cart", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}