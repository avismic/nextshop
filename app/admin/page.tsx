"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AdminIndexPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  useEffect(() => {
    const run = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        router.replace("/auth/login?next=/admin/products");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userRes.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.replace("/");
        return;
      }

      router.replace("/admin/products");

      
    };

    run();
  }, [router, supabase]);

  return null;
}