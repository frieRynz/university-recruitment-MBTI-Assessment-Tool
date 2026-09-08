"use client";

import { useState } from "react";
import { QUESTIONS, LIKERT_OPTIONS, type Dichotomy } from "@/lib/mbti/questions";
import { Card, ClarityBar } from "./ui";

interface ScoredResult {
  mbti_type: string;
  decision_style: string;
  decision_style_description: string;
  trait_scores: Record<Dichotomy, number>;
  clarity_scores: Record<Dichotomy, number>;
}

const BLOCKS: Dichotomy[] = ["E_I", "S_N", "T_F", "J_P"];
const BLOCK_LABELS: Record<Dichotomy, string> = {
  E_I: "Block 1 — Social (E–I)",
  S_N: "Block 2 — Vision (S–N)",
  T_F: "Block 3 — Decision (T–F)",
  J_P: "Block 4 — Lifestyle (J–P)",
};

/** Shared 12-question test runner: one dichotomy block at a time, 7-point scale, progress indicator. */
export function TestRunner({
  submitUrl,
  buildPayload,
  onDone,
}: {
  submitUrl: string;
  buildPayload: (answers: Record<Dichotomy, number[]>) => Record<string, unknown>;
  onDone?: () => void;
}) {
  const [blockIdx, setBlockIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<Dichotomy, number[]>>({ E_I: [], S_N: [], T_F: [], J_P: [] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ScoredResult | null>(null);

  const dichotomy = BLOCKS[blockIdx];
  const questions = QUESTIONS.filter((q) => q.dichotomy === dichotomy);
  const current = answers[dichotomy];
  const answered = current.length;

  function answer(score: number) {
    const next = { ...answers, [dichotomy]: [...current, score] };
    setAnswers(next);
    if (next[dichotomy].length === 3 && blockIdx < BLOCKS.length - 1) {
      setTimeout(() => setBlockIdx((i) => i + 1), 150);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const data = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(answers)),
      }).then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Submission failed");
        return j;
      });
      setResult(data.scored as ScoredResult);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <Card title="Your MBTI Result">
        <p className="font-mono text-4xl font-bold text-indigo-700">{result.mbti_type}</p>
        <p className="mt-1 text-lg font-semibold">{result.decision_style}</p>
        <p className="mb-4 text-sm text-slate-600">{result.decision_style_description}</p>
        <ClarityBar label="Social clarity (E–I)" value={result.clarity_scores.E_I} />
        <ClarityBar label="Vision clarity (S–N)" value={result.clarity_scores.S_N} />
        <ClarityBar label="Decision clarity (T–F)" value={result.clarity_scores.T_F} />
        <ClarityBar label="Lifestyle clarity (J–P)" value={result.clarity_scores.J_P} />
        <p className="mt-3 text-xs text-slate-500">
          Trait totals: E_I={result.trait_scores.E_I}, S_N={result.trait_scores.S_N},
          T_F={result.trait_scores.T_F}, J_P={result.trait_scores.J_P}
        </p>
      </Card>
    );
  }

  const totalAnswered = BLOCKS.reduce((n, b) => n + answers[b].length, 0);
  const allDone = totalAnswered === 12;

  return (
    <Card>
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-sm text-slate-600">
          <span>{BLOCK_LABELS[dichotomy]}</span>
          <span>{totalAnswered}/12 answered</span>
        </div>
        <div className="h-1.5 rounded bg-slate-200">
          <div className="h-1.5 rounded bg-indigo-500 transition-all" style={{ width: `${(totalAnswered / 12) * 100}%` }} />
        </div>
      </div>

      {questions.map((q, i) => {
        const val = current[i];
        return (
          <div key={q.id} className="mb-5">
            <p className="mb-2 font-medium">{q.text}</p>
            <div className="flex flex-wrap gap-1.5">
              {LIKERT_OPTIONS.map((opt) => (
                <button key={opt.value}
                  className={`rounded border px-2.5 py-1.5 text-xs ${
                    val === opt.value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 hover:bg-slate-100"
                  }`}
                  disabled={i < answered}
                  onClick={() => answer(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex justify-between">
        <button className="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
          disabled={blockIdx === 0 || current.length > 0}
          onClick={() => setBlockIdx((i) => Math.max(0, i - 1))}>
          ← Previous block
        </button>
        {allDone ? (
          <button className="rounded bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={busy} onClick={submit}>
            {busy ? "Scoring..." : "Submit Test"}
          </button>
        ) : (
          <span className="text-sm text-slate-400">Answer all 12 questions to submit</span>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </Card>
  );
}