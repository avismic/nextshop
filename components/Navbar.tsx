// "use client";

// import Link from "next/link";
// import Container from "./Container";
// import { useCart } from "@/store/cart";
// // later we'll connect to cart store
// // import { useCart } from "@/store/cart";

// export default function Navbar() {
//   // const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
//   const count = useCart((s) => s.count());

//   return (
//     <header className="sticky top-0 z-50 border-b bg-black/80 backdrop-blur">
//       <Container>
//         <div className="flex h-16 items-center justify-between">
//           <Link href="/" className="flex items-center gap-2 font-semibold">
//             <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
//               N
//             </span>
//             <span>NextShop</span>
//           </Link>

//           <nav className="flex items-center gap-6 text-sm text-white-700">
//             <Link href="/auth/login" className="hover:text-white-900">Login</Link>
//             <Link href="/products" className="hover:text-white-900">Products</Link>
//             <Link href="/account/orders" className="hover:text-white-900">Orders</Link>
//             <Link href="/cart" className="relative hover:text-white-900">
//               Cart
//               {count > 0 && (
//                 <span className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
//                   {count}
//                 </span>
//               )}
//             </Link>
//           </nav>
//         </div>
//       </Container>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Container from "./Container";
import { useCart } from "@/store/cart";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Role = "admin" | "user" | null;

export default function Navbar() {
  const count = useCart((s) => s.count());

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [role, setRole] = useState<Role>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const loadRole = async () => {
    setLoadingRole(true);

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
      setRole(null);
      setLoadingRole(false);
      return;
    }

    const uid = userRes.user.id;

    // Fetch role from profiles table (same approach as AdminShell)
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();

    if (pErr) {
      // If profile row is missing / RLS blocks, fail closed (no admin link)
      console.error("Failed to load profile role:", pErr.message);
      setRole("user");
    } else {
      setRole((profile?.role as Role) ?? "user");
    }

    setLoadingRole(false);
  };

  useEffect(() => {
    // initial role load
    loadRole();

    // keep navbar updated on login/logout
    // Supabase recommends keeping the callback fast and not awaiting inside it.
    // If you need async work, defer it (setTimeout) to avoid deadlocks. [2](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        loadRole();
      }, 0);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b bg-black/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              N
            </span>
            <span>NextShop</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-white-700">
            <Link href="/products" className="hover:text-white-900">
              Products
            </Link>

            <Link href="/account/orders" className="hover:text-white-900">
              Account
            </Link>

            {/* Show Admin only when role is admin */}
            {!loadingRole && isAdmin && (
              <Link href="/admin" className="hover:text-white-900">
                Admin
              </Link>
            )}

            <Link href="/cart" className="relative hover:text-white-900">
              Cart
              {count > 0 && (
                <span className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}