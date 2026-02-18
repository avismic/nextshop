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

      const uid = userRes.user.id;

      // ✅ Check only this user's wishlist
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", uid)
        .eq("product_id", productUuid)
        .limit(1);

      if (!error) setInWishlist(Boolean(data?.length));
    };

    run();
  }, [productUuid, supabase]);

  const toggle = async (e?: React.MouseEvent) => {
    // ✅ stop click from triggering Link navigation (ProductCard wraps WishlistButton in a Link)
    e?.preventDefault();
    e?.stopPropagation();

    setLoading(true);

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      alert("Please login to use wishlist.");
      setLoading(false);
      return;
    }

    const uid = userRes.user.id;

    if (inWishlist) {
      // ✅ Delete only this user's row
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", uid)
        .eq("product_id", productUuid);

      if (!error) setInWishlist(false);
      else alert(error.message);
    } else {
      // ✅ Insert must include user_id to satisfy schema + RLS
      const { error } = await supabase.from("wishlist_items").insert({
        user_id: uid,
        product_id: productUuid,
      });

      if (!error) setInWishlist(true);
      else alert(error.message);
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