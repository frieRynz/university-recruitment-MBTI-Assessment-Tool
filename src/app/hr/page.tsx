"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, api, LogoutButton } from "@/lib/client/TestRunnerWrapper";

interface ResultRow {
  id: number; employeeId: number; timestamp: string; mbtiResult: string; decisionStyle: string;
  employee: { id: number; name: string; email: string; dept: string };
}

// HR dashboard: all employee MBTI results as clickable rows, filterable by MBTI type and Employee ID.
export default function HrPage() {
  const { session, loading } = useSession();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [msg, setMsg] = useState("");
  const [mbti, setMbti] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const load = useCallback(() => {
    if (session?.role !== "HR") return;
    const params = new URLSearchParams();
    if (mbti.trim()) params.set("mbti", mbti.trim());
    if (employeeId.trim()) params.set("employeeId", employeeId.trim());
    api(`/api/hr/results${params.size ? `?${params.toString()}` : ""}`)
      .then((d) => setResults(d.results))
      .catch((e) => setMsg(e.message));
  }, [session, mbti, employeeId]);

  useEffect(load, [load]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || session.role !== "HR") {
    return <main className="p-8">Access denied — HR only. <Link href="/login" className="text-indigo-600">Login</Link></main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">HR Dashboard — Employee MBTI Results</h1>
        <LogoutButton />
      </div>
      {msg && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{msg}</p>}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">MBTI Type</label>
          <input
            className="w-32 rounded border px-3 py-1.5 text-sm"
            placeholder="e.g. INTJ"
            value={mbti}
            onChange={(e) => setMbti(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Employee ID</label>
          <input
            className="w-32 rounded border px-3 py-1.5 text-sm"
            placeholder="e.g. 3"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>
        <button
          className="rounded border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-100"
          onClick={() => { setMbti(""); setEmployeeId(""); }}
        >
          Clear filters
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>MBTI Type</th>
              <th>Style</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No results match the filters.</td></tr>
            )}
            {results.map((r) => (
              <tr key={r.id} className="cursor-pointer border-t hover:bg-indigo-50" onClick={() => window.location.assign(`/hr/employees/${r.employeeId}`)}>
                <td className="px-4 py-3">{r.employeeId}</td>
                <td className="font-medium">{r.employee.name}</td>
                <td>{r.employee.dept}</td>
                <td className="font-mono font-semibold text-indigo-700">{r.mbtiResult}</td>
                <td>{r.decisionStyle}</td>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">Click any row to view the employee&apos;s full profile and test result analysis.</p>
    </main>
  );
}
