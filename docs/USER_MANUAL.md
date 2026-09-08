# User Manual — University Executive Recruitment MBTI Assessment Tool

**Version:** 1.0 (prototype) · **Stack:** Next.js 15 + Prisma/PostgreSQL · **URL:** http://localhost:3000

This manual walks through **every use case** of the system with exact test data, step-by-step actions, and expected results. Each section ends with pass/fail checkboxes so it doubles as a QA test script.

---

## 1. Getting Started

### 1.1 Start the full stack (Docker)
```powershell
cd "d:\WERK_D\university-recruitment-MBTI Assessment Tool"
docker compose up --build -d
```
- App: **http://localhost:3000**
- PostgreSQL: host port **5433** (5432 is reserved for a local system Postgres), user `mbti`, password `mbti_secret`, db `mbti_db`
- Migrations run automatically in the `migrate` one-shot container. Seed data must be applied once from the host (Step 1.3).

### 1.2 Local development (alternative)
```powershell
docker compose up -d db      # database only
npm install
npx prisma migrate dev       # apply migrations
npm run db:seed              # load demo data
npm run dev                  # app on :3000
```

### 1.3 Apply seed data (Docker path, run once)
```powershell
$env:DATABASE_URL="postgresql://mbti:mbti_secret@localhost:5433/mbti_db?schema=public"
npm run db:seed
```

### 1.4 Seeded demo accounts

| Role | Email | Password | Lands on |
|---|---|---|---|
| HR Executive | `hr.exec@university.edu` | `Password123!` | `/hr` — HR Dashboard |
| Hiring Manager | `manager.ict@university.edu` | `Password123!` | `/manager` — Manager Dashboard |
| Faculty/Staff | `staff.sci@university.edu` | `Password123!` | `/employee` — Development Dashboard |
| Candidate | `david.ong@example.com` | `Password123!` | `/candidate` — My Assigned Assessments |
| Candidate | `priya.nair@example.com` | `Password123!` | `/candidate` |
| Candidate (internal) | `li.wei@example.com` | `Password123!` | `/candidate` |
| Candidate | `sara.lim@example.com` | `Password123!` | `/candidate` |

### 1.5 Run the unit tests
```powershell
npm test
```
Expected: **8 passed** — includes the grading-spec worked example (§6.4): answers E-I `[+3,+2,+2]`, S-N `[+1,+2,+1]`, T-F `[0,+1,0]`, J-P `[-3,-2,-2]` → `ESTP / The Dealmaker`, clarity `0.78 / 0.44 / 0.11 / 0.78`.

- [ ] Stack starts and home page shows three actor cards
- [ ] All 7 demo accounts log in successfully
- [ ] `npm test` passes 8/8

---

## 2. Test Data Inventory (seeded)

### Positions
| id | Title | Department | Level | Status | Tested candidates |
|---|---|---|---|---|---|
| 1 | Dean, Faculty of ICT | Faculty of ICT | DEAN | OPEN | 3 (David, Priya, Li Wei) |
| 2 | Department Head, Business Analytics | Business School | DEPARTMENT_HEAD | OPEN | 1 (Sara Lim) |

### Candidates & results
| Candidate | Source | Linked employee | Position | MBTI | Style | Clarity (S/V/D/L) | Decision |
|---|---|---|---|---|---|---|---|
| David Ong | EXTERNAL | — | 1 | ESTP | The Dealmaker | .78/.44/.11/.78 | INTERVIEWING (by Marcus Tan) |
| Priya Nair | EXTERNAL | — | 1 | ESTJ | The Executive | .67/.78/.56/.67 | SHORTLISTED (by Helen Reyes) |
| Li Wei | **INTERNAL** | Aisha Karim | 1 | ISTJ | The Logistician | .67/.78/.89/.33 | — |
| Sara Lim | EXTERNAL | — | 2 | ENFJ | The Mobilizer | .33/.22/.67/1.00 | — |

### Other seed rows
- Employee self-development history for Aisha Karim: 2 past attempts (ISTJ The Logistician, ESTJ The Executive).
- **Position 2 has NO pending assignment for David Ong** — UC6 (§8) creates it live as part of the HR cycle test.

### Answer-set → type cheat sheet (for scripted tests)
| Goal | E-I | S-N | T-F | J-P | Result |
|---|---|---|---|---|---|
| Dealmaker (ESTP) | `[+3,+2,+2]` | `[+1,+2,+1]` | `[0,+1,0]` | `[-3,-2,-2]` | 7/4/1/−7 → ESTP |
| Logistician (ISTJ) | `[-1,-2,0]` | `[+1,+2,+1]` | `[+1,0,+2]` | `[+2,+1,+3]` | −3/4/3/6 → ISTJ |
| Commander (ENTJ) | `[+3,+3,+3]` | `[+3,+3,+3]` | `[+3,+3,+3]` | `[+3,+3,+3]` | 9/9/9/9 → ENTJ |
| Advocate (INFP) | `[-3,-3,-3]` | `[-3,-3,-3]` | `[-3,-3,-3]` | `[-3,-3,-3]` | −9×4 → INFP |
| All neutral | `[0,0,0]` ×4 | | | | ESTJ (ties default to first letter) |

Likert mapping in the UI: Strongly agree = +3 … Neutral = 0 … Strongly disagree = −3.

## 3. UC1 — Registration (Module 1)

All steps happen on **/register**. First choose the account type toggle at the top: **Candidate** (default) or **Faculty / Staff**.

### 3.1 Register an external Candidate
1. Toggle **Candidate**.
2. Fill: Full name `Ravi Chandran` · DOB `1977-02-20` · Gender `Male` · Email `ravi.chandran@example.com` · Linked Employee ID *(leave blank)* · Password `Passw0rd!23`.
3. Click **Create Account**.
4. **Expected:** "Account created ✓" screen with a Go to Login button. Server console shows `[NOTIFICATION] VERIFY_EMAIL -> ravi.chandran@example.com`.
- [ ] Pass

### 3.2 Register an internal Candidate (linked to an existing Employee)
1. Toggle **Candidate**.
2. Fill: `Chong Mei Ling` · `1985-11-03` · `Female` · `meiling.chong@example.com` · Linked Employee ID **`3`** (Aisha Karim) · Password `Passw0rd!23`.
3. Submit. **Expected:** success. When HR opens the candidate list, this candidate shows source **INTERNAL**.
4. **Negative:** repeat with Linked Employee ID `999` → error "linkedEmployeeId does not exist" (HTTP 400).
- [ ] Pass (both)

### 3.3 Register an Employee (Faculty/Staff/HR/Manager)
1. Toggle **Faculty / Staff**. The form now shows **Department** and **Role** dropdowns.
2. Fill: `Nadia Rahman` · `1990-06-18` · `Female` · `nadia.rahman@university.edu` · Department `Faculty of ICT` · Role `HR Executive` · Password `Passw0rd!23`.
3. Submit. **Expected:** success; this user can log in and lands on `/hr`.
- [ ] Pass

### 3.4 Registration negative tests
| Test | Input | Expected |
|---|---|---|
| Duplicate email | register `david.ong@example.com` again | `409 Email already registered` |
| Short password | password `abc` | blocked, min-8 validation |
| Bad email | `not-an-email` | blocked by zod validation |

---

## 4. UC2 — Authentication (Module 2)

### 4.1 Login + role landing
For each seeded account in §1.4: go to **/login**, enter email + `Password123!`.
**Expected landing pages:** HR Executive → `/hr` · Hiring Manager → `/manager` · Faculty/Staff → `/employee` · Candidates → `/candidate`.
- [ ] All 4 roles land correctly

### 4.2 Wrong password
`hr.exec@university.edu` + wrong password → **"Invalid email or password"** (HTTP 401). No session cookie set.
- [ ] Pass

### 4.3 Logout
Click **Logout** on any dashboard → redirected to `/login`; reloading a dashboard afterwards shows "Access denied" (session destroyed).
- [ ] Pass

### 4.4 Password reset (stub)
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/reset-password -Method Post -ContentType 'application/json' -Body (@{email='staff.sci@university.edu';newPassword='NewPass123!'} | ConvertTo-Json)
```
Expected: `{ "ok": true }`; server console logs `[NOTIFICATION] PASSWORD_RESET`. New password works at /login; old one no longer does. (Reset it back afterwards.)
- [ ] Pass

---

## 5. UC3 — MBTI Learning Content (Module 3)

1. From the home page click **MBTI Learning Content** (or go to `/learning`).
2. **Expected content:**
   - The four dichotomies with E–I (Social Energy), S–N (Vision), T–F (Decision), J–P (Lifestyle) explanations.
   - The exact 12 assessment questions grouped by dichotomy, with the 7-point Likert scale note (+3 … −3).
   - The 16-type Decision-Maker Style Library (ENTJ The Commander … ISTP The Troubleshooter).
- [ ] All three sections render

## 6. UC4 — Employee Self-Development Test (Module 4 · Flow 3 · DSS Model layer)

**Actor:** Faculty/Staff (`staff.sci@university.edu`). This test is independent of recruitment; the employee sees NO recruitment data anywhere.

1. Log in as `staff.sci@university.edu` → **My Development Dashboard** (`/employee`).
   - Verify: Historical Results table already shows 2 seeded attempts (ISTJ The Logistician, ESTJ The Executive) with timestamps.
2. Click **Take MBTI Test**. The runner opens at *Block 1 — Social (E–I)*.
3. Answer the **Logistician** script from §2, one block at a time:
   - Block 1 (E–I): Slightly disagree (−1), Disagree (−2), Neutral (0)
   - Block 2 (S–N): Slightly agree (+1), Agree (+2), Slightly agree (+1)
   - Block 3 (T–F): Slightly agree (+1), Neutral (0), Agree (+2)
   - Block 4 (J–P): Agree (+2), Slightly agree (+1), Agree (+2)
   - Watch: progress indicator advances 0→12; the runner auto-advances blocks after the 3rd answer of a block; **Previous block** is disabled once a block has answers (one-way flow).
4. Click **Submit Test**.
   - **Expected result card:** **ISTJ — The Logistician**, with clarity bars ≈ Social 33% · Vision 44% · Decision 33% · Lifestyle 67%, and trait totals −3/4/3/6.
5. Result appears in the dashboard's **Latest Result** card and a new row is appended to **Historical Results** (retaking is always allowed for employees — no lock).
6. Click **MBTI Learning Content** link — accessible anytime.
7. **Privacy check:** nothing on this dashboard references positions, candidates, or decisions.

- [ ] Result exactly ISTJ / The Logistician
- [ ] History grows; retake allowed
- [ ] No recruitment data visible

---

## 7. UC5 — HR Recruitment Cycle (Module 5 · Flow 1)

**Actor:** HR Executive (`hr.exec@university.edu`) on `/hr`.

### 7.1 Create a Position
1. Under **Create Position** enter: Title `Vice Provost, Research` · Department `Office of Research` · Level `Vice Provost`.
2. Click **Create**. **Expected:** message "Position created"; it appears in the Positions table with status **OPEN** and Tested = 0.

### 7.2 Create an external Candidate (with invite)
1. Under **Create Candidate (invite)**: name `Farah Aziz` · DOB `1980-09-09` · Gender `Female` · email `farah.aziz@example.com` · temp password `TempPass123`.
2. Click **Create & Invite**. **Expected:** "Candidate created + invite sent (stub)"; server console logs `[NOTIFICATION] CANDIDATE_INVITED -> farah.aziz@example.com`.
3. Verify Farah can now log in at /login with `farah.aziz@example.com` / `TempPass123` (lands on `/candidate`, no assignments yet).

### 7.3 Create an internal-linked Candidate
Create candidate `Li Wei Promo` with email `liwei.promo@example.com` and Linked Employee ID `3` (Aisha Karim). **Expected:** source shows INTERNAL in the candidate dropdown.

### 7.4 Assign a Test
1. Under **Assign Test to Candidate**: candidate `Farah Aziz`, position `Vice Provost, Research` → **Assign**.
   - **Expected:** "Test assigned + candidate notified (stub)"; the **Test Assignments** card lists `Farah Aziz → Vice Provost, Research — Pending`.
2. **Duplicate-assign check:** assign the same pair again → error "Already assigned. Use reassign=true to reset." (HTTP 409).
3. Server console shows a second `CANDIDATE_INVITED` notification.
- [ ] Assignment appears as Pending

### 7.5 Close / Reopen a Position
Click **Close** on `Vice Provost, Research` → status CLOSED (it also disappears from future assign dropdowns). Click **Reopen** to restore.
- [ ] Status toggles

### 7.6 Positions table baseline
Confirm the two seeded positions show Tested = 3 and 1 respectively, with **Compare →** links.

## 8. UC6 — Candidate Takes an Assigned Test (Flow 2 · Test Locking)

**Actor:** Candidate (`david.ong@example.com`).

### 8.1 Prerequisite — HR assigns David to Position 2
1. Log out David; log in as HR (`hr.exec@university.edu`).
2. Assign Test: candidate `David Ong`, position `Department Head, Business Analytics` → **Assign**.
3. Log out; log in as `david.ong@example.com`.

### 8.2 Take the test
1. On **My Assigned Assessments**, David sees:
   - `Department Head, Business Analytics` with a **Take Test** button (PENDING).
   - `Dean, Faculty of ICT` marked **Completed ✓ (locked)** — his seeded result.
2. Click **Take Test** and answer the **Dealmaker** script (§2):
   - E–I: Strongly agree, Agree, Agree · S–N: Slightly agree, Agree, Slightly agree
   - T–F: Neutral, Slightly agree, Neutral · J–P: Strongly disagree, Disagree, Disagree
3. Submit. **Expected result:** **ESTP — The Dealmaker**, clarity ≈ 78% / 44% / 11% / 78%, trait totals 7/4/1/−7.
4. Back on the dashboard, the assignment now reads **Completed ✓ (locked)** and **My Results** shows the new ESTP card.
5. **Test-locking check:** the Take Test button is gone for that position.
6. Server console: `[NOTIFICATION] TEST_COMPLETED -> hr.exec@university.edu` (HR notified).
7. **Privacy check:** David sees only his own results; no other candidates, no decision outcomes.

### 8.3 Retake → blocked; reassignment → unlocked
1. Try `POST /api/candidate/submit` again with the same answers (DevTools/Swagger or curl): **HTTP 409** — "Test already submitted and locked…".
2. Log in as HR → Test Assignments → on David's completed row click **reassign** → status returns to **Pending** → David can take the test again (a NEW result row is created; the old result remains for history).

- [ ] Result exactly ESTP / The Dealmaker
- [ ] Completed assignment locked; retake 409
- [ ] HR reassign unlocks

---

## 9. UC7 — Candidate Comparison & Recruitment Decisions (6.3 / 6.5 · Flows 1 & 4)

### 9.1 As HR Executive
1. Log in as `hr.exec@university.edu` → Positions → **Compare →** on `Dean, Faculty of ICT`.
2. **Expected: three side-by-side cards** (David Ong ESTP Dealmaker, Priya Nair ESTJ Executive, Li Wei ISTJ Logistician), each with four clarity bars and current decision status (INTERVIEWING / SHORTLISTED / —).
3. On Li Wei's card select **Record decision… → SHORTLISTED**, note `Strong strategist` in the note field → decision recorded; the card shows **Decision: SHORTLISTED**.
4. Back on `/hr`, the **Decision Log** card now lists Li Wei's new decision (with his MBTI/style, status, and decider name).

### 9.2 As Hiring Manager (Flow 4)
1. Log in as `manager.ict@university.edu` → **Hiring Manager Dashboard**.
2. Positions table → **Compare & decide →** on `Dean, Faculty of ICT` → same comparison view.
3. Change David Ong's decision to **OFFERED** with note `Panel approved`. Expected: card shows Decision: OFFERED; decision log updated (one decision record per candidate/position — updated, not duplicated).
4. Try to **Create a Position** — not possible: the Manager dashboard has no position-management UI, and the API returns **403** (see §11).

### 9.3 Decision on an untested candidate (negative)
1. Compare `Vice Provost, Research` (Farah Aziz assigned but not tested) → comparison shows "No candidates have completed testing yet".
2. Via API, attempt `POST /api/decisions {candidateId: Farah, positionId: Vice Provost, status: HIRED}` → **HTTP 400** "Candidate has not completed a test for this position".
- [ ] Side-by-side comparison renders
- [ ] HR + Manager can record decisions
- [ ] Untested candidates cannot receive decisions

---

## 10. UC8 — Aggregate / Admin Reports (6.4)

**Actors:** HR Executive (`/hr` → **Aggregate Reports**) or Hiring Manager (report card on `/manager`).

**Expected content after running §6–§9:**
- **Total tests administered** — 4 seeded + 1 (David's) = 5, plus any Farah completed in §7–8 walkthroughs.
- **Decision style distribution** — bar chart, e.g. Dealmaker 2, Executive 1, Logistician 1, Mobilizer 1 (+ any new results).
- **Testing progress per position** — every position with level, status, tested count.
- **Decisions by status** — SHORTLISTED 2, INTERVIEWING→OFFERED 1, etc.

**Verify both roles see reports**; Candidates and Faculty/Staff do not (§11).

## 11. UC9 — RBAC Server-Side Enforcement Matrix (§5 use-case table)

RBAC lives in `src/lib/auth/rbac.ts` and is enforced inside **every** API handler — not just hidden in the UI. Test via the UI (menu items absent) AND via direct API calls (e.g. browser DevTools console `fetch(...)` while logged in as the role, or PowerShell `Invoke-RestMethod` with a login session).

| # | Actor | Action (API) | Expected |
|---|---|---|---|
| 1 | Anonymous | `GET /api/positions` | **401** Authentication required |
| 2 | Anonymous | `GET /api/decisions` | **401** |
| 3 | Candidate | `GET /api/positions` | **403** Forbidden |
| 4 | Candidate | `GET /api/candidates` | **403** |
| 5 | Candidate | `POST /api/assignments` | **403** (HR Executive only) |
| 6 | Candidate | `GET /api/comparison?positionId=1` | **403** |
| 7 | Candidate | `GET /api/reports/aggregate` | **403** |
| 8 | Candidate | `POST /api/candidate/submit` (unassigned position) | **403** "No test assigned for this position" |
| 9 | Faculty/Staff | `POST /api/mbti/employee` | **200** (allowed — own test) |
| 10 | Faculty/Staff or Candidate | `GET /api/mbti/employee` (another employee's history) | returns only own rows; other employees' data unreachable |
| 11 | HR Executive | `POST /api/mbti/employee` (take self-test) | **403** (HR does not take the test per §5 table) |
| 12 | Hiring Manager | `POST /api/positions` | **403** "Forbidden: HR Executive only" |
| 13 | Hiring Manager | `PATCH /api/positions` | **403** |
| 14 | Hiring Manager | `POST /api/candidates` | **403** |
| 15 | Hiring Manager | `POST /api/assignments` | **403** |
| 16 | HR Executive | `POST /api/decisions` | **201** (allowed) |
| 17 | Hiring Manager | `POST /api/decisions` | **201** (allowed) |
| 18 | Candidate | `GET /api/candidate/assignments` | 200 — but only **own** assignments (cross-candidate data never returned) |

- [ ] All negative rows return the expected status codes

---

## 12. UC10 — Notification Stubs (§7 cross-cutting)

Emails are logged to console (no SMTP). Watch the logs:
```powershell
docker compose logs -f web          # Docker path
# or the terminal running npm run dev
```

| Event | Trigger | Log line |
|---|---|---|
| CANDIDATE_INVITED | HR creates candidate (§7.2) or assigns test (§7.4) | `[NOTIFICATION] CANDIDATE_INVITED -> <email>` |
| TEST_COMPLETED | Candidate submits assigned test (§8.2) | `[NOTIFICATION] TEST_COMPLETED -> hr.exec@…` |
| DECISION_RECORDED | HR/Manager records a decision (§9) | `[NOTIFICATION] DECISION_RECORDED -> <candidate email>` |
| VERIFY_EMAIL | Any registration (§3) | `[NOTIFICATION] VERIFY_EMAIL -> <email>` |
| PASSWORD_RESET | Reset endpoint (§4.4) | `[NOTIFICATION] PASSWORD_RESET -> <email>` |

- [ ] All five event types appear when their triggers run

---

## 13. API Quick Reference (for scripted API testing)

All endpoints are JSON; authentication = the `mbti_session` httpOnly cookie set by login.

| Method & Path | Role(s) | Purpose |
|---|---|---|
| POST `/api/auth/register` | public | Register (see zod schemas in route) |
| POST `/api/auth/login` / `logout` / `me` | — / any / any | Session |
| POST `/api/auth/reset-password` | public | Password reset (stub) |
| GET `/api/auth/verify-email?email=` | public | Activation stub |
| GET `/api/mbti/questions` | any authenticated | Question bank + Likert options + 16 styles |
| POST `/api/mbti/employee` | FACULTY_STAFF | Submit self-development test |
| GET `/api/mbti/employee` | FACULTY_STAFF | Own result history |
| GET `/api/candidate/assignments` | CANDIDATE | Own assignments + own results |
| POST `/api/candidate/submit` | CANDIDATE | Submit test for a position (lock enforced) |
| GET/POST/PATCH `/api/positions` | HR/Mgr read · HR write | Position management |
| GET/POST `/api/candidates` | HR/Mgr read · HR write | Candidate profiles |
| GET/POST `/api/assignments` | HR/Mgr read · HR write (+`reassign:true`) | Test assignment |
| GET `/api/comparison?positionId=` | HR/Mgr | Side-by-side comparison |
| POST/GET `/api/decisions` | HR/Mgr | Record / list decisions |
| GET `/api/reports/aggregate` | HR/Mgr | Aggregate reports |

---

## 14. Known Prototype Limitations

1. **Email is stubbed** — all notifications are console logs; no SMTP.
2. **HTTP cookies** — `COOKIE_SECURE=true` must be set only for HTTPS deployments (default off so localhost/Docker HTTP works).
3. **Email verification & password reset** do not use real tokens/links — activation is implicit.
4. **Historical decision log** shows the current decision per candidate/position (one decision record per pairing, updated in place).
5. **Seed is idempotent** — `npm run db:seed` upserts demo rows; it will not duplicate them.

---

## 15. Full Regression Checklist (copy into your test report)

- [ ] 1.5 Unit tests 8/8 (incl. §6.4 worked example)
- [ ] §3.1–3.4 Registration: external, internal, employee, negatives
- [ ] §4.1–4.4 Login/landing/401/logout/reset
- [ ] §5 Learning content renders
- [ ] §6 Employee self-test → ISTJ, history, privacy
- [ ] §7 HR cycle: position, candidates, assignment, 409, close/reopen
- [ ] §8 Candidate test → ESTP, lock 409, reassign unlock
- [ ] §9 Comparison + decisions (HR & Manager), untested-negative
- [ ] §10 Aggregate reports (both roles)
- [ ] §11 RBAC matrix (18 rows)
- [ ] §12 Five notification events logged




