"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, api, Card, LogoutButton } from "@/lib/client/TestRunnerWrapper";

interface Position { id: number; title: string; department: string; level: string; status: string; _count: { candidateResults: number } }
interface Decision { id: number; status: string; notes?: string; candidate: { name: string }; position: { title: string }; decidedBy: { name: string }; mbtiResult: { mbtiResult: string; decisionStyle: string }; decisionDate: string }
interface Report { totalTests: number; byStyle: Record<string, number>; byPosition: { position: string; level: string; status: string; tested: number }[]; decisions: { status: string; _count: { status: number } }[] }

// Flow 4: Hiring Manager — positions overview, candidate comparison, decision log, aggregate reports.
export default function ManagerPage() {
  const { session, loading } = useSession();
  const [positions, setPositions] = useState<Position[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (session?.role !== "HIRING_MANAGER") return;
    api("/api/positions").then((d) => setPositions(d.positions)).catch(() => {});
    api("/api/decisions").then((d) => setDecisions(d.decisions)).catch(() => {});
    api("/api/reports/aggregate").then(setReport).catch(() => {});
  }, [session]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || session.role !== "HIRING_MANAGER") {
    return <main className="p-8">Access denied — Hiring Manager only. <Link href="/login" className="text-indigo-600">Login</Link></main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hiring Manager Dashboard</h1>
        <LogoutButton />
      </div>

      <Card title="Positions & Candidate Comparison">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="pb-2">Title</th><th>Level</th><th>Status</th><th>Tested</th><th></th></tr></thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2 font-medium">{p.title}<span className="block text-xs text-slate-400">{p.department}</span></td>
                <td>{p.level.replace("_", " ")}</td>
                <td>{p.status}</td>
                <td>{p._count.candidateResults}</td>
                <td><Link className="text-indigo-600 hover:underline" href={`/hr/compare/${p.id}`}>Compare & decide →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Decision Log">
          <ul className="space-y-2 text-sm">
            {decisions.length === 0 && <li className="text-slate-500">No decisions recorded.</li>}
            {decisions.map((d) => (
              <li key={d.id} className="border-b pb-2">
                <p><strong>{d.candidate.name}</strong> — {d.position.title}</p>
                <p className="text-xs text-slate-500">{d.mbtiResult.mbtiResult} ({d.mbtiResult.decisionStyle}) → <strong>{d.status}</strong></p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Aggregate Reports">
          {report ? (
            <div className="text-sm">
              <p className="mb-2">Total tests administered: <strong>{report.totalTests}</strong></p>
              <p className="mb-1 font-medium">Decision style distribution:</p>
              <ul className="mb-3 space-y-0.5">
                {Object.entries(report.byStyle).sort((a, b) => b[1] - a[1]).map(([style, n]) => (
                  <li key={style} className="flex justify-between"><span>{style}</span><span className="font-mono">{n}</span></li>
                ))}
              </ul>
              <p className="mb-1 font-medium">Decisions by status:</p>
              <ul>
                {report.decisions.map((d) => (
                  <li key={d.status} className="flex justify-between"><span>{d.status}</span><span className="font-mono">{d._count.status}</span></li>
                ))}
              </ul>
            </div>
          ) : <p className="text-sm text-slate-500">Loading…</p>}
        </Card>
      </div>
    </main>
  );
}