"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = supabaseBrowser();

  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/auth/login");
        return;
      }
      setEmail(data.user.email ?? null);
      setReady(true);
    };
    run();
  }, [router, supabase]);

  const navItem = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={[
          "rounded-lg px-3 py-2 text-sm transition",
          active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  };

  if (!ready) {
    return (
      <main className="py-10">
        <Container>
          <p className="text-sm text-gray-600">Loading account…</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-[220px] space-y-4">
            <div>
              <div className="text-sm text-gray-300">Signed in as</div>
              <div className="text-gray-500 break-all">{email}</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500">ACCOUNT</div>
              <div className="flex flex-col gap-1">
                {navItem("/account/orders", "Orders")}
                {navItem("/account/wishlist", "Wishlist")}
                {navItem("/account/addresses", "Addresses")}
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/auth/login");
              }}
            >
              Logout
            </Button>
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </Container>
    </main>
  );
}