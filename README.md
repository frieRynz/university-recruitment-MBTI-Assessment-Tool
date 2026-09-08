# University Executive Recruitment MBTI Assessment Tool

A **Decision-Maker Personality Assessment Tool** built for a university HR office. It uses the **MBTI personality framework** — mapped to **16 executive decision-making styles** — to help HR Executives and Hiring Managers assess, compare, and decide on candidates for academic leadership positions (Dean, Department Head, Vice Provost, Program Director).

Existing faculty/staff can also take the assessment independently for **personal development**, completely separate from any recruitment process.

> 📘 **Step-by-step testing guide with scripted test data for every use case:** [`docs/USER_MANUAL.md`](docs/USER_MANUAL.md)

---

## 🎯 Purpose

Recruiting a Dean or Department Head is not just about academic merit — it is about **how a person makes decisions**. This tool answers that question in a structured, repeatable way:

1. Every candidate for a leadership position takes a standardized 12-question assessment.
2. The system converts their answers into an MBTI type (e.g. `ESTP`) and an **executive decision-making style** (e.g. *The Dealmaker*), plus **clarity scores** showing how strongly each trait came through.
3. HR compares all candidates for a position side-by-side and records the recruitment decision — creating a documented, auditable hiring trail.

---

## ⚙️ How It Works

```
 HR Executive                Candidate / Employee              System
 ────────────                ────────────────────              ──────
 create position      ──┐
 create candidate     ──┼──►  receives assignment  ──►  12-question MBTI test
 assign test          ──┘        (7-point Likert,            (E-I → S-N → T-F → J-P)
                                 4 dichotomy blocks)
                                        │
                                        ▼
                              ┌─────────────────────────┐
                              │     Scoring Engine      │
                              │  sums → letters → type  │
                              │  clarity = |total| / 9  │
                              │  type → decision style  │
                              └─────────────────────────┘
                                        │
        ┌───────────────────────────────┴──────────────────────┐
        ▼                                                      ▼
 HR Executive / Hiring Manager                      Candidate / Employee
 compare candidates side-by-side,                   view own result + clarity bars
 record decisions, view reports                     (+ history, self-development only)
```

**Scoring in short:** each of the 4 dichotomies (E-I Social, S-N Vision, T-F Decision, J-P Lifestyle) has 3 questions scored −3…+3. The letter with the higher (or tied) total wins; `clarity = |total| / 9`; the resulting 16-type combination maps to a named executive style (e.g. `ENTJ → The Commander`). The engine is a pure function covered by unit tests, including the grading-spec worked example.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 15 (App Router, TypeScript) — API route handlers, no separate backend |
| Database | PostgreSQL 16 + Prisma ORM (type-safe schema + migrations) |
| Auth | Custom JWT session in an httpOnly cookie (`jose`), bcrypt password hashing |
| Validation | zod on every API request body |
| RBAC | Server-side role enforcement in every API handler (`src/lib/auth/rbac.ts`) |
| Styling | Tailwind CSS v4 |
| Unit tests | Vitest (8 tests incl. the scoring worked example) |
| Deployment | Docker Compose — `web` + `db` services + one-shot migration container |

## 👥 Actors & What Each Can Do

| Capability | Candidate | Faculty/Staff | HR Executive | Hiring Manager |
|---|:---:|:---:|:---:|:---:|
| Register / login / reset password | ✓ | ✓ | ✓ | ✓ |
| View MBTI learning content | ✓ | ✓ | ✓ | ✓ |
| Take MBTI test | ✓ (assigned) | ✓ (self-initiated) | — | — |
| View own MBTI result / history | ✓ | ✓ | — | — |
| Manage positions | — | — | ✓ | — |
| Manage candidate profiles | — | — | ✓ | — |
| Assign tests to candidates | — | — | ✓ | — |
| Compare candidates | — | — | ✓ | ✓ |
| Record recruitment decisions | — | — | ✓ | ✓ |
| View aggregate reports | — | — | ✓ | ✓ |

Every rule above is enforced **server-side** on each API route — hiding a button in the UI is not the security boundary.

---

## 🧩 Use Cases

| # | Use Case | Where |
|---|---|---|
| UC1 | Register (candidate external/internal, employee, HR, manager) | `/register` |
| UC2 | Login / logout / password reset | `/login` |
| UC3 | Browse MBTI learning content & 16-style library | `/learning` |
| UC4 | Employee self-development test + result history | `/employee` |
| UC5 | HR recruitment cycle: positions, candidates, test assignment | `/hr` |
| UC6 | Candidate takes assigned test (locked after submit; HR can reassign) | `/candidate` |
| UC7 | Candidate comparison + recruitment decisions | `/hr/compare/[positionId]` |
| UC8 | Aggregate reports (style distribution, progress, decisions) | `/hr/reports` |
| UC9 | Server-side RBAC (permission matrix) | every API route |
| UC10 | Notifications (invite / test completed / decision — console-stubbed email) | server logs |

➡️ Full walkthroughs with exact test inputs: [`docs/USER_MANUAL.md`](docs/USER_MANUAL.md)

---

## 🚀 Getting Started

### Option A — Docker (recommended)

```bash
docker compose up --build -d
```

- App: **http://localhost:3000**
- PostgreSQL: container `db`, exposed on host port **5433** (5432 is avoided in case a local Postgres exists), user `mbti` / password `mbti_secret` / database `mbti_db`
- Database migrations run automatically in a one-shot `migrate` container before the web app starts.

Then load the demo data **once** from the host:

```bash
# .env is copied from .env.example on first setup
npm install
npm run db:seed
```

### Option B — Local development

```bash
npm install
docker compose up -d db          # database only
npx prisma migrate dev           # create/update schema
npm run db:seed                  # demo data
npm run dev                      # http://localhost:3000
```

### Run the tests

```bash
npm test        # 8 unit tests, incl. the grading-spec worked example (ESTP / The Dealmaker)
```

## 🎭 Getting Started in Each Role

All demo accounts use the password **`Password123!`**. The seed is idempotent — re-running it never duplicates data.

| Role | Demo email |
|---|---|
| HR Executive | `hr.exec@university.edu` |
| Hiring Manager | `manager.ict@university.edu` |
| Faculty/Staff | `staff.sci@university.edu` |
| Candidate | `david.ong@example.com` (also `priya.nair@`, `li.wei@`, `sara.lim@example.com`) |

### 👤 As a Candidate — *take an assigned assessment*

Log in: `david.ong@example.com`

1. Land on **My Assigned Assessments** — you see the positions you are being tested for.
2. (Optional) Open **Learning Content** to understand the framework first.
3. Click **Take Test** → answer 4 blocks of 3 questions on a 7-point scale with a live progress bar.
4. Submit → see your **MBTI type, decision style, and clarity bars**.
5. The test is now **locked** — only HR can unlock it (reassign) if a retake is needed.

*No account yet?* Register at `/register` (Candidate tab). External applicants leave "Linked Employee ID" empty; internal staff applying for a role enter their employee ID so HR knows they're an internal candidate.

### 👤 As Faculty/Staff — *self-development testing*

Log in: `staff.sci@university.edu`

1. Land on **My Development Dashboard** — see your latest result and past attempts with timestamps.
2. Click **Take MBTI Test** any time — this is independent of all recruitment activity.
3. Retake freely; every attempt is kept in **Historical Results** so you can track how your profile shifts.
4. You will never see recruitment data — this dashboard is personal.

*No account yet?* Register at `/register` (Faculty/Staff tab) — the form adds Department and Role fields.

### 🗂️ As HR Executive — *run the whole recruitment cycle*

Log in: `hr.exec@university.edu`

1. **Create Position** — e.g. "Dean, Faculty of ICT" with department and level (status Open).
2. **Create Candidate** — external (name, DOB, gender, email → invite sent) or internal (link an existing employee by ID).
3. **Assign Test** — pick candidate + position; the candidate gets notified (stubbed) and sees the test on their dashboard.
4. **Compare →** — once candidates have tested, view side-by-side decision styles + clarity bars.
5. **Record Decision** — SHORTLISTED → INTERVIEWING → OFFERED → HIRED / REJECTED, with notes; the decision log keeps the audit trail.
6. Finished with a role? **Close** the position (re-openable later).

### 🧑‍💼 As Hiring Manager — *review the shortlist*

Log in: `manager.ict@university.edu`

1. Land on the **Manager Dashboard** — positions with test counts, decision log, and aggregate reports.
2. Open **Compare & decide** on a position to review candidates' decision styles side-by-side.
3. **Record or update decisions** (defer creation of positions/candidates to HR — enforced server-side).
4. Check **Aggregate Reports** for decision-style distribution and hiring patterns.

## 🗄️ Database Schema (overview)

| Model | Purpose |
|---|---|
| `Employee` | Faculty/staff; can self-test or (HR/Manager) manage recruitment |
| `EmployeeMBTIResult` | Self-development test results (retake-able, with history) |
| `Position` | A leadership opening (level, status OPEN/CLOSED, posted by HR) |
| `Candidate` | Person assessed for a position; optionally linked to an Employee (internal) |
| `CandidateMBTIResult` | Test result scoped to a **candidate + position** pair (new row per reassignment) |
| `RecruitmentDecision` | One decision record per candidate/position pairing (unique constraint) |
| `TestAssignment` | HR's test assignment (PENDING → COMPLETED; reassignable) |

Full ERD-level detail: `prisma/schema.prisma`.

---

## 🔐 Environment Variables

Copy `.env.example` → `.env`:

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://mbti:mbti_secret@localhost:5433/mbti_db?schema=public` |
| `AUTH_SECRET` | JWT signing secret | long random string |
| `NEXT_PUBLIC_APP_URL` | Base URL used in stubbed email links | `http://localhost:3000` |
| `COOKIE_SECURE` | Set `true` **only** behind HTTPS | `false` |

---

## 📁 Project Structure

```
├── docs/USER_MANUAL.md          # full testing guide (per-use-case scripts)
├── prisma/
│   ├── schema.prisma            # all models + enums
│   ├── migrations/              # SQL migrations
│   └── seed.ts                  # idempotent demo data
├── src/
│   ├── app/
│   │   ├── api/                 # backend route handlers (auth, mbti, positions,
│   │   │                        #   candidates, assignments, comparison,
│   │   │                        #   decisions, reports)
│   │   ├── login/ register/ learning/
│   │   ├── employee/            # faculty/staff dashboard
│   │   ├── candidate/           # candidate dashboard + test runner
│   │   ├── hr/                  # HR dashboard, comparison, reports
│   │   └── manager/             # hiring manager dashboard
│   ├── lib/
│   │   ├── mbti/                # ⭐ scoring engine (pure functions): questions,
│   │   │                        #   scoring, 16-style lookup
│   │   ├── auth/                # JWT session + RBAC helpers
│   │   └── client/              # shared UI components + test runner
├── tests/scoring.test.ts        # unit tests incl. the worked-example fixture
├── Dockerfile                   # multi-stage build (standalone output)
└── docker-compose.yml           # web + db (+ one-shot migrate)
```

---

## ✅ Feature Summary

- 12-question MBTI assessment, 7-point Likert, one dichotomy block at a time with progress indicator
- Pure, unit-tested scoring engine → MBTI type + executive decision style + 0–1 clarity per trait
- Role-based access control enforced server-side on every endpoint (401/403 verified)
- Two independent test tracks: recruitment (candidate+position scoped, submit-locked) and self-development (retake-able with history)
- Candidate comparison with clarity bars; recruitment decision log; aggregate style-distribution reports
- Internal candidate linking to employee records; test reassignment by HR
- Console-stubbed notifications (no SMTP needed); Dockerized one-command deployment

## ⚠️ Known Prototype Limitations

- Email sending is stubbed (console logs) — no SMTP integration.
- Email verification / password reset don't use real tokenized links (activation is implicit).
- Decision log shows the current decision per pairing (updated in place), not a full status history.
- Set `COOKIE_SECURE=true` only when serving over HTTPS.

---

*Built as a functional prototype for a class project (DSS-layered assessment tool). Not a production hiring system.*

---

*Built as a functional prototype for a class project (DSS-layered assessment tool). Not a production hiring system.*

