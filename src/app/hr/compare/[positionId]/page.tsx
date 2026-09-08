"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, api, Card, ClarityBar } from "@/lib/client/TestRunnerWrapper";

interface CandidateRow {
  resultId: number;
  candidate: { id: number; name: string; email: string; source: string };
  mbtiResult: string; decisionStyle: string; timestamp: string;
  clarity: { social: number; vision: number; decision: number; lifestyle: number };
  decisionStatus: string | null;
}

const STATUSES = ["SHORTLISTED", "INTERVIEWING", "OFFERED", "HIRED", "REJECTED"] as const;

// 6.3 Candidate Comparison + 6.5 decision recording — shared by HR Executive and Hiring Manager.
export default function ComparePage() {
  const params = useParams<{ positionId: string }>();
  const router = useRouter();
  const { session, loading } = useSession();
  const [data, setData] = useState<{ position: { title: string }; candidates: CandidateRow[] } | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    if (!session || (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER")) return;
    api(`/api/comparison?positionId=${params.positionId}`).then(setData).catch((e) => setMsg(e.message));
  }, [session, params.positionId]);

  useEffect(load, [load]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER")) {
    return <main className="p-8">Access denied — HR/Hiring Manager only.</main>;
  }

  async function recordDecision(candidateId: number, status: string) {
    try {
      await api("/api/decisions", {
        method: "POST",
        body: JSON.stringify({ candidateId, positionId: Number(params.positionId), status, notes: note || undefined }),
      });
      setMsg(`Decision recorded: ${status}`);
      setNote("");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <button className="mb-4 text-sm text-indigo-600 hover:underline"
        onClick={() => router.back()}>← Back</button>
      <h1 className="mb-1 text-2xl font-bold">Candidate Comparison</h1>
      <p className="mb-6 text-slate-600">{data?.position.title ?? "..."}</p>
      {msg && <p className="mb-4 rounded bg-indigo-50 p-2 text-sm text-indigo-700">{msg}</p>}

      {!data || data.candidates.length === 0 ? (
        <Card><p className="text-sm text-slate-500">No candidates have completed testing for this position yet.</p></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.candidates.map((c) => (
            <Card key={c.resultId}>
              <p className="font-semibold">{c.candidate.name}</p>
              <p className="text-xs text-slate-500">{c.candidate.email} · {c.candidate.source}</p>
              <p className="mt-2 font-mono text-2xl font-bold text-indigo-700">{c.mbtiResult}</p>
              <p className="mb-3 text-sm font-semibold">{c.decisionStyle}</p>
              <ClarityBar label="Social (E–I)" value={c.clarity.social} />
              <ClarityBar label="Vision (S–N)" value={c.clarity.vision} />
              <ClarityBar label="Decision (T–F)" value={c.clarity.decision} />
              <ClarityBar label="Lifestyle (J–P)" value={c.clarity.lifestyle} />
              {c.decisionStatus && (
                <p className="mt-2 rounded bg-green-50 p-1.5 text-center text-xs font-medium text-green-700">Decision: {c.decisionStatus}</p>
              )}
              <select className="mt-3 w-full rounded border px-2 py-1.5 text-sm"
                value=""
                onChange={(e) => e.target.value && recordDecision(c.candidate.id, e.target.value)}>
                <option value="">Record decision…</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="mt-2 w-full rounded border px-2 py-1.5 text-xs" placeholder="Optional note for next decision"
                value={note} onChange={(e) => setNote(e.target.value)} />
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}