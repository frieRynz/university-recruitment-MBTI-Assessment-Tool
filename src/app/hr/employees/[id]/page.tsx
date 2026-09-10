"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession, api, Card, ClarityBar } from "@/lib/client/TestRunnerWrapper";

interface MbtiResult {
  id: number; timestamp: string; mbtiResult: string; decisionStyle: string;
  socialRatingScore: string; visionRatingScore: string; decisionRatingScore: string; lifestyleRatingScore: string;
  socialClarity: number; visionClarity: number; decisionClarity: number; lifestyleClarity: number;
}
interface Employee {
  id: number; name: string; email: string; dept: string; role: string;
  gender: string; dob: string; createdAt: string;
  mbtiResults: MbtiResult[];
}

// HR view of one employee: full profile + full analysis of each MBTI attempt.
export default function HrEmployeeDetailPage() {
  const { session, loading } = useSession();
  const params = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.role !== "HR" || !params?.id) return;
    api(`/api/hr/employees/${params.id}`)
      .then((d) => setEmployee(d.employee))
      .catch((e) => setError(e.message));
  }, [session, params?.id]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!session || session.role !== "HR") {
    return <main className="p-8">Access denied — HR only. <Link href="/login" className="text-indigo-600">Login</Link></main>;
  }
  if (error) return <main className="p-8 text-red-600">{error} <Link href="/hr" className="text-indigo-600">← Back to dashboard</Link></main>;
  if (!employee) return <main className="p-8">Loading...</main>;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/hr" className="text-sm text-indigo-600 hover:underline">← Back to HR Dashboard</Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">Employee Profile</h1>

      <div className="mb-8 grid gap-4 rounded-lg border bg-white p-6 text-sm sm:grid-cols-2">
        <p><span className="text-slate-500">Employee ID:</span> <strong>{employee.id}</strong></p>
        <p><span className="text-slate-500">Name:</span> <strong>{employee.name}</strong></p>
        <p><span className="text-slate-500">Email:</span> {employee.email}</p>
        <p><span className="text-slate-500">Department:</span> {employee.dept}</p>
        <p><span className="text-slate-500">Role:</span> {employee.role}</p>
        <p><span className="text-slate-500">Gender:</span> {employee.gender}</p>
        <p><span className="text-slate-500">Date of birth:</span> {new Date(employee.dob).toLocaleDateString()}</p>
        <p><span className="text-slate-500">Registered:</span> {new Date(employee.createdAt).toLocaleDateString()}</p>
      </div>

      <h2 className="mb-4 text-xl font-semibold">MBTI Test Results ({employee.mbtiResults.length} attempt{employee.mbtiResults.length === 1 ? "" : "s"})</h2>
      {employee.mbtiResults.length === 0 && <p className="text-sm text-slate-500">This employee has not taken the test yet.</p>}
      <div className="space-y-4">
        {employee.mbtiResults.map((r) => (
          <Card key={r.id} title={`Attempt — ${new Date(r.timestamp).toLocaleString()}`}>
            <p className="font-mono text-3xl font-bold text-indigo-700">{r.mbtiResult}</p>
            <p className="mb-3 font-semibold">{r.decisionStyle}</p>
            <p className="mb-3 text-sm text-slate-600">
              Letters: <strong>{r.socialRatingScore}{r.visionRatingScore}{r.decisionRatingScore}{r.lifestyleRatingScore}</strong>
            </p>
            <ClarityBar label={`Social clarity (${r.socialRatingScore}–${r.socialRatingScore === "E" ? "I" : "E"})`} value={r.socialClarity} />
            <ClarityBar label={`Vision clarity (${r.visionRatingScore}–${r.visionRatingScore === "S" ? "N" : "S"})`} value={r.visionClarity} />
            <ClarityBar label={`Decision clarity (${r.decisionRatingScore}–${r.decisionRatingScore === "T" ? "F" : "T"})`} value={r.decisionClarity} />
            <ClarityBar label={`Lifestyle clarity (${r.lifestyleRatingScore}–${r.lifestyleRatingScore === "J" ? "P" : "J"})`} value={r.lifestyleClarity} />
          </Card>
        ))}
      </div>
    </main>
  );
}
