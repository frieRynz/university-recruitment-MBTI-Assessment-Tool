"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, api, Card, LogoutButton } from "@/lib/client/TestRunnerWrapper";

interface Position { id: number; title: string; department: string; level: string; status: string; _count: { candidateResults: number } }
interface Candidate { id: number; name: string; email: string; source: string }
interface Assignment { id: number; status: string; candidateId: number; candidate: { name: string }; position: { title: string } }
interface Decision { id: number; status: string; notes?: string; candidate: { name: string }; position: { title: string }; decidedBy: { name: string }; mbtiResult: { mbtiResult: string; decisionStyle: string } }

// Flow 1: HR Executive — positions, candidates, test assignment, decision log.
export default function HrPage() {
  const { session, loading } = useSession();
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [msg, setMsg] = useState("");

  const [newPos, setNewPos] = useState({ title: "", department: "", level: "DEAN" });
  const [newCand, setNewCand] = useState({ name: "", dob: "", gender: "M", email: "", linkedEmployeeId: "", password: "" });
  const [assignSel, setAssignSel] = useState({ candidateId: "", positionId: "" });

  const load = useCallback(() => {
    if (session?.role !== "HR_EXECUTIVE") return;
    Promise.all([
      api("/api/positions"), api("/api/candidates"),
      api("/api/assignments"), api("/api/decisions"),
    ]).then(([p, c, a, d]) => {
      setPositions(p.positions); setCandidates(c.candidates);
      setAssignments(a.assignments); setDecisions(d.decisions);
    }).catch((e) => setMsg(e.message));
  }, [session]);

  useEffect(load, [load]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || session.role !== "HR_EXECUTIVE") {
    return <main className="p-8">Access denied — HR Executive only. <Link href="/login" className="text-indigo-600">Login</Link></main>;
  }

  async function act(fn: () => Promise<unknown>, okMsg: string) {
    try { await fn(); setMsg(okMsg); load(); } catch (e) { setMsg(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">HR Executive Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/hr/reports" className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">Aggregate Reports</Link>
          <LogoutButton />
        </div>
      </div>
      {msg && <p className="mb-4 rounded bg-indigo-50 p-2 text-sm text-indigo-700">{msg}</p>}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card title="Create Position">
          <div className="space-y-2">
            <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Title (e.g. Dean, Faculty of ICT)" value={newPos.title} onChange={(e) => setNewPos({ ...newPos, title: e.target.value })} />
            <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Department" value={newPos.department} onChange={(e) => setNewPos({ ...newPos, department: e.target.value })} />
            <select className="w-full rounded border px-3 py-2 text-sm" value={newPos.level} onChange={(e) => setNewPos({ ...newPos, level: e.target.value })}>
              <option value="DEPARTMENT_HEAD">Department Head</option><option value="DEAN">Dean</option>
              <option value="VICE_PROVOST">Vice Provost</option><option value="PROGRAM_DIRECTOR">Program Director</option>
            </select>
            <button className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={!newPos.title || !newPos.department}
              onClick={() => act(() => api("/api/positions", { method: "POST", body: JSON.stringify(newPos) }), "Position created")}>
              Create
            </button>
          </div>
        </Card>

        <Card title="Create Candidate (invite)">
          <div className="space-y-2">
            <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Full name" value={newCand.name} onChange={(e) => setNewCand({ ...newCand, name: e.target.value })} />
            <div className="flex gap-2">
              <input className="w-1/2 rounded border px-3 py-2 text-sm" type="date" value={newCand.dob} onChange={(e) => setNewCand({ ...newCand, dob: e.target.value })} />
              <select className="w-1/2 rounded border px-3 py-2 text-sm" value={newCand.gender} onChange={(e) => setNewCand({ ...newCand, gender: e.target.value })}>
                <option value="M">Male</option><option value="F">Female</option><option value="OTHER">Other</option>
              </select>
            </div>
            <input className="w-full rounded border px-3 py-2 text-sm" type="email" placeholder="Email" value={newCand.email} onChange={(e) => setNewCand({ ...newCand, email: e.target.value })} />
            <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Linked Employee ID (internal, optional)" value={newCand.linkedEmployeeId} onChange={(e) => setNewCand({ ...newCand, linkedEmployeeId: e.target.value })} />
            <input className="w-full rounded border px-3 py-2 text-sm" type="password" placeholder="Temp password (min 8)" value={newCand.password} onChange={(e) => setNewCand({ ...newCand, password: e.target.value })} />
            <button className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={!newCand.name || !newCand.email || newCand.password.length < 8}
              onClick={() => act(() => api("/api/candidates", {
                method: "POST",
                body: JSON.stringify({ ...newCand, linkedEmployeeId: newCand.linkedEmployeeId ? Number(newCand.linkedEmployeeId) : null }),
              }), "Candidate created + invite sent (stub)")}>
              Create & Invite
            </button>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Card title="Assign Test to Candidate">
          <div className="flex flex-wrap items-end gap-2">
            <select className="rounded border px-3 py-2 text-sm" value={assignSel.candidateId} onChange={(e) => setAssignSel({ ...assignSel, candidateId: e.target.value })}>
              <option value="">Select candidate…</option>
              {candidates.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.source})</option>)}
            </select>
            <select className="rounded border px-3 py-2 text-sm" value={assignSel.positionId} onChange={(e) => setAssignSel({ ...assignSel, positionId: e.target.value })}>
              <option value="">Select position…</option>
              {positions.filter((p) => p.status === "OPEN").map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={!assignSel.candidateId || !assignSel.positionId}
              onClick={() => act(() => api("/api/assignments", { method: "POST", body: JSON.stringify({ candidateId: Number(assignSel.candidateId), positionId: Number(assignSel.positionId) }) }), "Test assigned + candidate notified (stub)")}>
              Assign
            </button>
          </div>
        </Card>
      </div>

      <Card title="Positions">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="pb-2">Title</th><th>Level</th><th>Status</th><th>Tested</th><th>Compare</th><th>Toggle</th></tr></thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2 font-medium">{p.title}<span className="block text-xs text-slate-400">{p.department}</span></td>
                <td>{p.level.replace("_", " ")}</td>
                <td><span className={p.status === "OPEN" ? "text-green-700" : "text-slate-400"}>{p.status}</span></td>
                <td>{p._count.candidateResults}</td>
                <td><Link className="text-indigo-600 hover:underline" href={`/hr/compare/${p.id}`}>Compare →</Link></td>
                <td>
                  <button className="text-xs text-slate-600 underline"
                    onClick={() => act(() => api("/api/positions", { method: "PATCH", body: JSON.stringify({ id: p.id, status: p.status === "OPEN" ? "CLOSED" : "OPEN" }) }), "Status updated")}>
                    {p.status === "OPEN" ? "Close" : "Reopen"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Test Assignments">
          <ul className="space-y-1 text-sm">
            {assignments.length === 0 && <li className="text-slate-500">None yet.</li>}
            {assignments.map((a) => (
              <li key={a.id} className="flex justify-between border-b pb-1">
                <span>{a.candidate.name} → {a.position.title}</span>
                <span className={a.status === "PENDING" ? "text-amber-600" : "text-green-700"}>
                  {a.status === "PENDING" ? "Pending" : "Completed"}
                  {a.status === "COMPLETED" && (
                    <button className="ml-2 text-xs text-indigo-600 underline"
                      onClick={() => act(() => api("/api/assignments", { method: "POST", body: JSON.stringify({ candidateId: a.candidateId, positionId: positions.find((p) => p.title === a.position.title)?.id, reassign: true }) }), "Reassigned — candidate may retake")}>
                      reassign
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Decision Log">
          <ul className="space-y-2 text-sm">
            {decisions.length === 0 && <li className="text-slate-500">No decisions recorded.</li>}
            {decisions.map((d) => (
              <li key={d.id} className="border-b pb-2">
                <p><strong>{d.candidate.name}</strong> — {d.position.title}</p>
                <p className="text-xs text-slate-500">{d.mbtiResult.mbtiResult} ({d.mbtiResult.decisionStyle}) → <strong>{d.status}</strong> by {d.decidedBy.name}</p>
                {d.notes && <p className="text-xs italic text-slate-500">&ldquo;{d.notes}&rdquo;</p>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}