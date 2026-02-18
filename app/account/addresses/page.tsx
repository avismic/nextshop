"use client";

import { useEffect, useState } from "react";
import AccountShell from "@/components/account/AccountShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Address = {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export default function AddressesPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const load = async () => {
    setErr(null);
    setLoading(true);

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
      setLoading(false);
      return; // AccountShell will redirect
    }

    const uid = userRes.user.id;

    const { data, error } = await supabase
      .from("addresses")
      .select("id,user_id,label,line1,city,state,pincode,is_default")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    setAddresses((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async () => {
    setErr(null);

    if (
      !form.line1 ||
      !form.city ||
      !form.state ||
      !/^\d{6}$/.test(form.pincode)
    ) {
      setErr("Please fill all fields. Pincode must be 6 digits.");
      return;
    }

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
      setErr("Please login again.");
      return;
    }

    const uid = userRes.user.id;

    const { error } = await supabase.from("addresses").insert({
      user_id: uid, // ✅ REQUIRED: matches schema + RLS
      label: form.label,
      line1: form.line1,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      is_default: addresses.length === 0, // first becomes default
    });

    if (error) {
      setErr(error.message);
      return;
    }

    setForm({ label: "Home", line1: "", city: "", state: "", pincode: "" });
    load();
  };

  const setDefault = async (id: string) => {
    setErr(null);

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
      setErr("Please login again.");
      return;
    }

    const uid = userRes.user.id;

    // 1) unset current defaults for this user only
    const { error: unsetErr } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", uid);

    if (unsetErr) {
      setErr(unsetErr.message);
      return;
    }

    // 2) set selected address as default (also scoped by user_id)
    const { error: setErr2 } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", uid);

    if (setErr2) {
      setErr(setErr2.message);
      return;
    }

    load();
  };

  const remove = async (id: string) => {
    setErr(null);

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
      setErr("Please login again.");
      return;
    }

    const uid = userRes.user.id;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", uid);

    if (error) setErr(error.message);
    load();
  };

  return (
    <AccountShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Addresses</h1>
          <p className="mt-1 text-sm text-gray-600">
            Saved addresses for faster checkout.
          </p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="font-semibold">Add address</div>
        </CardHeader>
        <CardContent className="p-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Label</label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Pincode</label>
              <Input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Address</label>
            <Input
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">City</label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">State</label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
          </div>

          {err && <p className="text-sm text-rose-600">{err}</p>}
          <Button onClick={add}>Save address</Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="mt-6">
          <CardContent className="p-6 text-sm text-gray-600">Loading…</CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4">
          {addresses.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {a.label} {a.is_default ? "• Default" : ""}
                  </div>
                  <div className="text-sm text-gray-600">
                    {a.line1}, {a.city}, {a.state} {a.pincode}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!a.is_default && (
                    <Button variant="secondary" onClick={() => setDefault(a.id)}>
                      Set default
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => remove(a.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {addresses.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-gray-600">
                No saved addresses yet.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AccountShell>
  );
}