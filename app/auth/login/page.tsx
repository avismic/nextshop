"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";

import { useSearchParams } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/account/orders";


  const signIn = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);
    router.replace(next);
    router.refresh();
    console.log("login result:", { error });
  };

  return (
    <main className="py-10">
      <Container>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <div className="text-base font-semibold">Login</div>
            <p className="text-sm text-gray-600">Use your email and password.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Password</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>

            {err && <p className="text-sm text-rose-600">{err}</p>}

            <Button className="w-full" onClick={signIn}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}