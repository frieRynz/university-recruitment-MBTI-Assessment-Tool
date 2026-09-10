"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", dob: "", gender: "M", email: "", dept: "",
    role: "EMPLOYEE", password: "",
  });
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  if (ok) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Account created ✓</h1>
        <Link href="/login" className="rounded bg-indigo-600 px-5 py-2 text-white">Go to Login</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold">Register Account</h1>
      <form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <input className="w-full rounded border px-3 py-2" placeholder="Full name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        <div className="flex gap-3">
          <input className="w-1/2 rounded border px-3 py-2" type="date" required value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          <select className="w-1/2 rounded border px-3 py-2" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="M">Male</option><option value="F">Female</option><option value="OTHER">Other</option>
          </select>
        </div>
        <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="Department" required value={form.dept} onChange={(e) => set("dept", e.target.value)} />
        <select className="w-full rounded border px-3 py-2" value={form.role} onChange={(e) => set("role", e.target.value)}>
          <option value="EMPLOYEE">Internal Employee</option>
          <option value="HR">HR</option>
        </select>
        <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password (min 8 chars)" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700">Create Account</button>
        <p className="text-sm text-slate-500">Already registered? <Link href="/login" className="text-indigo-600">Login</Link></p>
      </form>
    </main>
  );
}