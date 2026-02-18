"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";

type CsvRow = {
  name: string;
  description: string;
  price_cents: number;
  category: string;
  stock: number;
  rating: number;
  image_filename?: string;
};

type ImportResult = {
  rowNumber: number;
  name: string;
  ok: boolean;
  productId?: string;
  error?: string;
};

const REQUIRED_HEADERS = [
  "name",
  "description",
  "price_cents",
  "category",
  "stock",
  "rating",
  "image_filename",
] as const;

export default function AdminImportProductsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [file, setFile] = useState<File | null>(null);

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [summary, setSummary] = useState<string>("");

  // Build public storage URL from filename in your public bucket "product-images"
  // This follows the standard pattern: public bucket object URL.
  const buildImageUrl = (filename: string) => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const safe = sanitizeFilename(filename);
    return `${base}/storage/v1/object/public/product-images/${safe}`;
  };

  // Also store an "image_path" for DB, useful for referencing bucket object key.
  const buildImagePath = (filename: string) => {
    const safe = sanitizeFilename(filename);
    return `product-images/${safe}`;
  };

  const runImport = async () => {
    if (!file) return;

    setRunning(true);
    setResults([]);
    setSummary("");

    try {
      // Ensure user is logged in (AdminShell already checks admin, but we verify session exists)
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        setSummary("Not logged in. Please login again.");
        setRunning(false);
        return;
      }

      const text = await file.text();
      const { rows, error } = parseCsv(text);

      if (error) {
        setSummary(`CSV parse error: ${error}`);
        setRunning(false);
        return;
      }

      if (!rows.data.length) {
        setSummary("No data rows found in CSV.");
        setRunning(false);
        return;
      }

      // Validate headers
      const missing = REQUIRED_HEADERS.filter((h) => !rows.headers.includes(h));
      if (missing.length) {
        setSummary(`Missing CSV headers: ${missing.join(", ")}`);
        setRunning(false);
        return;
      }

      const parsedRows: CsvRow[] = [];
      const parseErrors: string[] = [];

      rows.data.forEach((r, idx) => {
        const rowNumber = idx + 2; // header is line 1

        const name = (r.name ?? "").trim();
        const description = (r.description ?? "").trim();
        const category = (r.category ?? "").trim();
        const image_filename = (r.image_filename ?? "").trim();

        const price_cents = Number(r.price_cents);
        const stock = Number(r.stock);
        const rating = Number(r.rating);

        if (!name || !description || !category) {
          parseErrors.push(`Row ${rowNumber}: name/description/category cannot be empty`);
          return;
        }

        if (Number.isNaN(price_cents) || price_cents < 0) {
          parseErrors.push(`Row ${rowNumber}: price_cents must be a non-negative number`);
          return;
        }

        if (Number.isNaN(stock) || stock < 0) {
          parseErrors.push(`Row ${rowNumber}: stock must be a non-negative number`);
          return;
        }

        if (Number.isNaN(rating) || rating < 0 || rating > 5) {
          parseErrors.push(`Row ${rowNumber}: rating must be between 0 and 5`);
          return;
        }

        parsedRows.push({
          name,
          description,
          price_cents,
          category,
          stock,
          rating,
          image_filename: image_filename || undefined,
        });
      });

      if (parseErrors.length) {
        setSummary(`Validation failed:\n${parseErrors.join("\n")}`);
        setRunning(false);
        return;
      }

      // Import sequentially (simple + reliable for admin CSV size)
      const out: ImportResult[] = [];

      for (let i = 0; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const rowNumber = i + 2;

        // 1) Insert product
        const { data: created, error: pErr } = await supabase
          .from("products")
          .insert({
            name: row.name,
            description: row.description,
            price_cents: row.price_cents,
            category: row.category,
            stock: row.stock,
            rating: row.rating,
            active: true,
          })
          .select("id")
          .single();

        if (pErr || !created) {
          out.push({
            rowNumber,
            name: row.name,
            ok: false,
            error: pErr?.message ?? "Failed to insert product",
          });
          continue;
        }

        const productId = created.id as string;

        // 2) Link image if filename provided
        if (row.image_filename) {
          const imageUrl = buildImageUrl(row.image_filename);
          const imagePath = buildImagePath(row.image_filename);

          const { error: imgErr } = await supabase.from("product_images").insert({
            product_id: productId,
            image_url: imageUrl,
            image_path: imagePath,
            sort_order: 0,
          });

          if (imgErr) {
            // Product inserted but image meta failed
            out.push({
              rowNumber,
              name: row.name,
              ok: false,
              productId,
              error: `Product created but image link failed: ${imgErr.message}`,
            });
            continue;
          }
        }

        out.push({ rowNumber, name: row.name, ok: true, productId });
      }

      setResults(out);

      const okCount = out.filter((x) => x.ok).length;
      const failCount = out.length - okCount;
      setSummary(`Import complete. ✅ Success: ${okCount}, ❌ Failed: ${failCount}`);

    } catch (e: any) {
      setSummary(`Unexpected error: ${e?.message ?? String(e)}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CSV Import</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload a CSV to add products in bulk.
          </p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="text-base font-semibold text-black">Upload CSV</div>
          <p className="text-sm text-gray-600">
            Header: <code>name,description,price_cents,category,stock,rating,image_filename</code>
          </p>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-black">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <Button onClick={runImport} disabled={!file || running} className="mt-2">
            {running ? "Importing…" : "Import CSV"}
          </Button>

          {summary && (
            <pre className="whitespace-pre-wrap rounded border bg-gray-50 p-3 text-xs text-gray-800">
              {summary}
            </pre>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="text-base font-semibold">Results</div>
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            {results.map((r) => (
              <div
                key={`${r.rowNumber}-${r.name}`}
                className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">
                      Row {r.rowNumber}: {r.name}
                    </div>
                    {r.productId && (
                      <div className="mt-1 break-all text-xs text-gray-500">
                        Product UUID: {r.productId}
                      </div>
                    )}
                  </div>
                  <div className={r.ok ? "text-emerald-700" : "text-rose-700"}>
                    {r.ok ? "SUCCESS" : "FAILED"}
                  </div>
                </div>

                {!r.ok && r.error && (
                  <pre className="mt-2 whitespace-pre-wrap rounded bg-red-50 p-2 text-xs text-red-800">
                    {r.error}
                  </pre>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}

/**
 * Minimal CSV parser:
 * - supports commas
 * - supports quoted fields with commas inside
 * - expects first row as headers
 */
function parseCsv(text: string): { rows: { headers: string[]; data: Record<string, string>[] }; error?: string } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: { headers: [], data: [] }, error: "CSV must include header + at least 1 row." };
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 1 && cols[0] === "") continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] ?? "").trim();
    });
    data.push(row);
  }

  return { rows: { headers, data } };
}

// Splits a CSV line handling quoted values
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' ) {
      // Toggle quotes unless escaped
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function sanitizeFilename(name: string) {
  // Avoid path traversal and weird characters
  return name.replace(/[/\\]/g, "").replace(/\s+/g, "-");
}