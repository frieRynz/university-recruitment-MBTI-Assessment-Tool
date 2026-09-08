"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, api, Card } from "@/lib/client/TestRunnerWrapper";

interface Report { totalTests: number; byStyle: Record<string, number>; byPosition: { position: string; level: string; status: string; tested: number }[]; decisions: { status: string; _count: { status: number } }[] }

// 6.4 Aggregate/admin reports — HR Executive + Hiring Manager.
export default function ReportsPage() {
  const { session, loading } = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session && (session.role === "HR_EXECUTIVE" || session.role === "HIRING_MANAGER")) {
      api("/api/reports/aggregate").then(setReport).catch((e) => setError(e.message));
    }
  }, [session]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER")) {
    return <main className="p-8">Access denied — HR/Hiring Manager only.</main>;
  }

  const maxStyle = report ? Math.max(...Object.values(report.byStyle), 1) : 1;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href={session.role === "HR_EXECUTIVE" ? "/hr" : "/manager"} className="text-sm text-indigo-600 hover:underline">← Back to dashboard</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Aggregate Reports</h1>
      {error && <p className="text-red-600">{error}</p>}
      {report && (
        <div className="space-y-6">
          <Card title={`Total tests administered: ${report.totalTests}`}>
            <p className="mb-3 font-medium">Decision style distribution</p>
            {Object.entries(report.byStyle).sort((a, b) => b[1] - a[1]).map(([style, n]) => (
              <div key={style} className="mb-2">
                <div className="flex justify-between text-sm"><span>{style}</span><span className="font-mono">{n}</span></div>
                <div className="h-2 rounded bg-slate-200">
                  <div className="h-2 rounded bg-indigo-500" style={{ width: `${(n / maxStyle) * 100}%` }} />
                </div>
              </div>
            ))}
          </Card>

          <Card title="Testing progress per position">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500"><th className="pb-2">Position</th><th>Level</th><th>Status</th><th>Tested</th></tr></thead>
              <tbody>
                {report.byPosition.map((p) => (
                  <tr key={p.position} className="border-t">
                    <td className="py-2">{p.position}</td>
                    <td>{p.level.replace("_", " ")}</td>
                    <td>{p.status}</td>
                    <td className="font-mono">{p.tested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Decisions by status">
            <ul className="text-sm">
              {report.decisions.length === 0 && <li className="text-slate-500">No decisions yet.</li>}
              {report.decisions.map((d) => (
                <li key={d.status} className="flex justify-between border-b py-1">
                  <span>{d.status}</span><span className="font-mono">{d._count.status}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </main>
  );
}