"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export default function WishlistButton({ productUuid }: { productUuid: string }) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("product_id", productUuid)
        .limit(1);

      if (!error) setInWishlist(Boolean(data?.length));
    };

    run();
  }, [productUuid, supabase]);

  const toggle = async () => {
    setLoading(true);

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      alert("Please login to use wishlist.");
      setLoading(false);
      return;
    }

    if (inWishlist) {
      await supabase.from("wishlist_items").delete().eq("product_id", productUuid);
      setInWishlist(false);
    } else {
      const { error } = await supabase.from("wishlist_items").insert({ product_id: productUuid });
      if (!error) setInWishlist(true);
    }

    setLoading(false);
  };

  return (
    <Button
      variant={inWishlist ? "primary" : "secondary"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {inWishlist ? "♥" : "♡"}
    </Button>
  );
}