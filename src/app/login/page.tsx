"use client";

import { useState } from "react";
import Link from "next/link";

const HOME_BY_ROLE: Record<string, string> = {
  HR: "/hr",
  EMPLOYEE: "/employee",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      window.location.href = HOME_BY_ROLE[data.role] ?? "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>
      <form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input className="w-full rounded border px-3 py-2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input className="w-full rounded border px-3 py-2" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
          {busy ? "Signing in..." : "Login"}
        </button>
        <p className="text-sm text-slate-500">
          No account? <Link href="/register" className="text-indigo-600">Register</Link>
        </p>
      </form>
      <div className="mt-6 rounded-lg border bg-white p-4 text-xs text-slate-500">
        <p className="mb-1 font-semibold">Demo accounts (password: Password123!)</p>
        <p>HR — hr.exec@university.edu</p>
        <p>Employee — staff.sci@university.edu</p>
      </div>
    </main>
  );
}