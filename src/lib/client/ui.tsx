"use client";

import { useEffect, useState } from "react";

export interface SessionInfo {
  id: number;
  name: string;
  email: string;
  role: "CANDIDATE" | "FACULTY_STAFF" | "HR_EXECUTIVE" | "HIRING_MANAGER";
  principalType: "EMPLOYEE" | "CANDIDATE";
}

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setSession(s))
      .finally(() => setLoading(false));
  }, []);

  return { session, loading };
}

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
      {children}
    </div>
  );
}

export function ClarityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 rounded bg-slate-200">
        <div className="h-2 rounded bg-indigo-500" style={{ width: `${Math.min(100, value * 100)}%` }} />
      </div>
    </div>
  );
}

export function LogoutButton() {
  return (
    <button
      className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Logout
    </button>
  );
}