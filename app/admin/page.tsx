import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  return (
    <main className="py-10">
      <Container>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-gray-600">
          You’re an admin. Next: add product CRUD + CSV import + image uploads.
        </p>
      </Container>
    </main>
  );
}