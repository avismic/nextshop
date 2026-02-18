"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const categories = ["all", "electronics", "fashion", "books", "home", "Smartphones"] as const;

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // IMPORTANT: stringify so we can safely depend on current params
  const spString = useMemo(() => sp.toString(), [sp]);

  const [q, setQ] = useState(() => sp.get("q") ?? "");

  const category = sp.get("category") ?? "all";
  const sort = sp.get("sort") ?? "";

  const replaceParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(spString); // ✅ always start from latest
    mutate(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  // Debounced search that preserves other filters
  useEffect(() => {
    const t = setTimeout(() => {
      replaceParams((params) => {
        const v = q.trim();
        if (v) params.set("q", v);
        else params.delete("q");
      });
    }, 300);

    return () => clearTimeout(t);
    // include spString so we don’t overwrite category/sort changes
  }, [q, spString]); // ✅ key fix

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center text-black">
          <div className="w-full md:max-w-sm">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
            />
          </div>

          <Select
            value={category}
            onChange={(e) =>
              replaceParams((params) => {
                const v = e.target.value;
                if (!v || v === "all") params.delete("category");
                else params.set("category", v);
              })
            }
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </Select>

          <Select
            value={sort}
            onChange={(e) =>
              replaceParams((params) => {
                const v = e.target.value;
                if (!v) params.delete("sort");
                else params.set("sort", v);
              })
            }
          >
            <option value="">Sort</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </Select>
        </div>
      </div>
    </div>
  );
}