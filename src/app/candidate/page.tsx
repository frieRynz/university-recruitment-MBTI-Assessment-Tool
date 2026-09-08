"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, api, Card, ClarityBar, LogoutButton } from "@/lib/client/TestRunnerWrapper";
import { TestRunner } from "@/lib/client/TestRunner";
import type { Dichotomy } from "@/lib/mbti/questions";

interface Assignment {
  id: number; status: "PENDING" | "COMPLETED";
  position: { id: number; title: string; department: string; level: string; status: string };
}
interface ResultRow {
  id: number; positionId: number; timestamp: string; mbtiResult: string; decisionStyle: string;
  socialClarity: number; visionClarity: number; decisionClarity: number; lifestyleClarity: number;
}

// Flow 2: Candidate — assigned assessments, take test per position, view own result.
export default function CandidatePage() {
  const { session, loading } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [activePosition, setActivePosition] = useState<number | null>(null);

  const load = useCallback(() => {
    if (session?.role === "CANDIDATE") {
      api("/api/candidate/assignments").then((d) => {
        setAssignments(d.assignments);
        setResults(d.results);
      }).catch(() => {});
    }
  }, [session]);

  useEffect(load, [load]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || session.role !== "CANDIDATE") {
    return <main className="p-8">Access denied. <Link href="/login" className="text-indigo-600">Login</Link></main>;
  }

  const activeAssignment = assignments.find((a) => a.position.id === activePosition);
  const pending = assignments.filter((a) => a.status === "PENDING");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Assigned Assessments</h1>
          <p className="text-slate-600">{session.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/learning" className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">Learning Content</Link>
          <LogoutButton />
        </div>
      </div>

      {activePosition !== null && activeAssignment?.status === "PENDING" ? (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Test for: {activeAssignment.position.title}</h2>
          <TestRunner
            submitUrl="/api/candidate/submit"
            buildPayload={(a: Record<Dichotomy, number[]>) => ({ positionId: activePosition, ...a })}
            onDone={() => { setActivePosition(null); load(); }}
          />
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          {assignments.length === 0 && (
            <Card><p className="text-sm text-slate-500">No assessments assigned yet. HR will notify you when a test is assigned.</p></Card>
          )}
          {assignments.map((a) => (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{a.position.title}</p>
                  <p className="text-sm text-slate-500">{a.position.department} · {a.position.level.replace("_", " ")} · Position {a.position.status}</p>
                </div>
                {a.status === "PENDING" ? (
                  <button className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                    onClick={() => setActivePosition(a.position.id)}>
                    Take Test
                  </button>
                ) : (
                  <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-700">Completed ✓ (locked)</span>
                )}
              </div>
            </Card>
          ))}
          {pending.length === 0 && assignments.length > 0 && (
            <p className="text-sm text-slate-500">All assigned assessments are completed. HR can reassign if a retake is needed.</p>
          )}
        </div>
      )}

      {results.length > 0 && (
        <Card title="My Results">
          {results.map((r) => (
            <div key={r.id} className="mb-4 border-b pb-4 last:border-0">
              <p className="font-mono text-2xl font-bold text-indigo-700">{r.mbtiResult}</p>
              <p className="mb-2 font-semibold">{r.decisionStyle}</p>
              <ClarityBar label="Social clarity" value={r.socialClarity} />
              <ClarityBar label="Vision clarity" value={r.visionClarity} />
              <ClarityBar label="Decision clarity" value={r.decisionClarity} />
              <ClarityBar label="Lifestyle clarity" value={r.lifestyleClarity} />
            </div>
          ))}
          <p className="text-xs text-slate-400">Your results are visible only to HR/Hiring Managers for the positions you were tested for.</p>
        </Card>
      )}
    </main>
  );
}