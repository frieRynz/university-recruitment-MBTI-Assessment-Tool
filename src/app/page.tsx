import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-4 text-3xl font-bold">University Executive Recruitment MBTI Assessment Tool</h1>
      <p className="mb-8 text-slate-600">
        Decision-maker personality assessment for academic leadership recruitment —
        powered by the MBTI framework mapped to 16 executive decision-making styles.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/login" className="rounded bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700">Login</Link>
        <Link href="/register" className="rounded border border-indigo-600 px-5 py-2.5 text-indigo-600 hover:bg-indigo-50">Register</Link>
        <Link href="/learning" className="rounded border border-slate-300 px-5 py-2.5 hover:bg-slate-100">MBTI Learning Content</Link>
      </div>
      <div className="mt-12 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <strong className="block text-slate-900">Candidates</strong>
          Take assigned assessments and view your decision-making style.
        </div>
        <div className="rounded-lg border bg-white p-4">
          <strong className="block text-slate-900">Faculty / Staff</strong>
          Self-development testing with historical results.
        </div>
        <div className="rounded-lg border bg-white p-4">
          <strong className="block text-slate-900">HR & Hiring Managers</strong>
          Manage positions, compare candidates, record decisions.
        </div>
      </div>
    </main>
  );
}