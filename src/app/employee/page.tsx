"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, api, Card, ClarityBar, LogoutButton } from "@/lib/client/TestRunnerWrapper";
import { TestRunner } from "@/lib/client/TestRunner";
import type { Dichotomy } from "@/lib/mbti/questions";

interface ResultRow {
  id: number; timestamp: string; mbtiResult: string; decisionStyle: string;
  socialClarity: number; visionClarity: number; decisionClarity: number; lifestyleClarity: number;
}

// Flow 3: Employee self-development — take test, view own result + history. No recruitment data.
export default function EmployeePage() {
  const { session, loading } = useSession();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [showTest, setShowTest] = useState(false);

  const load = useCallback(() => {
    if (session?.role === "FACULTY_STAFF") {
      api("/api/mbti/employee").then((d) => setResults(d.results)).catch(() => {});
    }
  }, [session]);

  useEffect(load, [load]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || session.role !== "FACULTY_STAFF") {
    return <main className="p-8">Access denied. <Link href="/login" className="text-indigo-600">Login</Link></main>;
  }

  const latest = results[0];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Development Dashboard</h1>
          <p className="text-slate-600">{session.name} — Faculty/Staff self-development</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mb-6 flex gap-3">
        <Link href="/learning" className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">MBTI Learning Content</Link>
        <button onClick={() => setShowTest((s) => !s)} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
          {showTest ? "Hide test" : results.length ? "Retake MBTI Test" : "Take MBTI Test"}
        </button>
      </div>

      {showTest && (
        <div className="mb-6">
          <TestRunner
            submitUrl="/api/mbti/employee"
            buildPayload={(a: Record<Dichotomy, number[]>) => a}
            onDone={() => { setShowTest(false); load(); }}
          />
        </div>
      )}

      {latest && (
        <div className="mb-6">
          <Card title="Latest Result">
            <p className="font-mono text-3xl font-bold text-indigo-700">{latest.mbtiResult}</p>
            <p className="mb-3 font-semibold">{latest.decisionStyle}</p>
            <ClarityBar label="Social clarity (E–I)" value={latest.socialClarity} />
            <ClarityBar label="Vision clarity (S–N)" value={latest.visionClarity} />
            <ClarityBar label="Decision clarity (T–F)" value={latest.decisionClarity} />
            <ClarityBar label="Lifestyle clarity (J–P)" value={latest.lifestyleClarity} />
          </Card>
        </div>
      )}

      <Card title="Historical Results (past attempts)">
        {results.length === 0 ? (
          <p className="text-sm text-slate-500">No attempts yet — take the test above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th className="pb-2">Timestamp</th><th>Type</th><th>Style</th></tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="font-mono">{r.mbtiResult}</td>
                  <td>{r.decisionStyle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </main>
  );
}