"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const signUp = async () => {
    setErr(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setErr(error.message);

    // After signup, profile trigger will run server-side in Supabase DB.
    router.push("/auth/login");
  };

  return (
    <main className="py-10">
      <Container>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <div className="text-base font-semibold">Create account</div>
            <p className="text-sm text-gray-600">Email + password signup.</p>
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

            <Button className="w-full" onClick={signUp}>
              Sign up
            </Button>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}