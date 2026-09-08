import Link from "next/link";
import { QUESTIONS } from "@/lib/mbti/questions";
import { DECISION_STYLES } from "@/lib/mbti/styles";

// 3.1/3.2 MBTI Overview + Decision-Maker Style Library (server component, no auth required to READ).
export default function LearningPage() {
  const dichotomies = [
    { key: "E_I", label: "E–I: Social Energy", first: "E — Extraversion", second: "I — Introversion",
      desc: "Where you direct energy: outward toward people and activity, or inward toward reflection and ideas." },
    { key: "S_N", label: "S–N: Vision", first: "S — Sensing", second: "N — Intuition",
      desc: "How you take in information: concrete facts and reality, or patterns, possibilities and imagination." },
    { key: "T_F", label: "T–F: Decision", first: "T — Thinking", second: "F — Feeling",
      desc: "How you decide: objective principles and standards, or values and impact on people." },
    { key: "J_P", label: "J–P: Lifestyle", first: "J — Judging", second: "P — Perceiving",
      desc: "How you approach structure: settled plans and schedules, or flexibility and spontaneity." },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold">MBTI Learning Content</h1>
      <p className="mb-8 text-slate-600">Understand the framework before taking the assessment.</p>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">The Four Dichotomies</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {dichotomies.map((d) => (
            <div key={d.key} className="rounded-lg border bg-white p-5">
              <h3 className="font-semibold">{d.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{d.desc}</p>
              <p className="mt-2 text-sm"><strong>{d.first}</strong> vs <strong>{d.second}</strong></p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">The 12 Assessment Questions (7-point Likert)</h2>
        <ol className="list-decimal space-y-1 pl-6 text-sm text-slate-700">
          {QUESTIONS.map((q) => (
            <li key={q.id}>{q.text} <span className="text-slate-400">({q.dichotomy})</span></li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-slate-500">Scale: Strongly agree (+3) … Neutral (0) … Strongly disagree (−3).</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Decision-Maker Style Library — all 16 types</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(DECISION_STYLES).map(([type, s]) => (
            <div key={type} className="rounded-lg border bg-white p-4">
              <p className="font-mono font-semibold text-indigo-700">{type} — {s.style}</p>
              <p className="mt-1 text-sm text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Link href="/" className="text-indigo-600 hover:underline">← Back to home</Link>
    </main>
  );
}