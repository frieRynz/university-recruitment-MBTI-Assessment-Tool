# User Manual — Employee MBTI Assessment Tool

A step-by-step guide to testing every feature of the app. All demo accounts use the password **`Password123!`**.

---

## 1. Setup & Demo Accounts

### 1.1 Start the app (Docker)

```bash
docker compose up --build -d
npm run db:seed        # demo data (idempotent)
```

App: **http://localhost:3000**

### 1.2 Seeded demo accounts

| Role | Email | Password | Lands on |
|---|---|---|---|
| HR | `hr.exec@university.edu` | `Password123!` | `/hr` — HR Dashboard |
| Internal Employee | `staff.sci@university.edu` | `Password123!` | `/employee` — My Development Dashboard |
| Internal Employee | `nadia.rahman@university.edu` | `Password123!` | `/employee` |
| Internal Employee | `li.wei@university.edu` | `Password123!` | `/employee` |

The seed also creates several scored MBTI results across these accounts so the HR dashboard has data immediately.

### 1.3 Run the unit tests

```bash
npm test        # scoring engine tests, incl. the grading-spec worked example
```

---

## 2. Registration (Employees & HR)

1. Go to **/register**.
2. Fill: full name, date of birth, gender, email, **Department**.
3. Pick a role: **Internal Employee** or **HR**.
4. Password (min 8 chars) → **Create Account**. **Expected:** "Account created ✓".
5. Go to **/login** and sign in — you land on `/employee` (Internal Employee) or `/hr` (HR).

---

## 3. Login & Logout

1. Go to **/login**, enter email + password.
   - **Expected landing:** HR → `/hr` · Internal Employee → `/employee`.
2. Wrong password → **Expected:** "Invalid email or password".
3. **Logout** (top-right on any dashboard) clears the session and returns you to the public pages.

---

## 4. MBTI Learning Content

- Click **MBTI Learning Content** (from the home page or the employee dashboard).
- **Expected content:**
  - The four dichotomies (E–I Social Energy, S–N Vision, T–F Decision, J–P Lifestyle).
  - All 12 assessment questions with their 7-point Likert scale (Strongly agree +3 … Strongly disagree −3).
  - The full **16-type style library** with descriptions.

---

## 5. Take the MBTI Test (Internal Employee or HR)

1. Log in as `staff.sci@university.edu` → **My Development Dashboard**.
2. Click **Take MBTI Test** (or **Retake MBTI Test** if you already have results).
3. Answer 4 blocks of 3 questions (E–I → S–N → T–F → J–P) on the 7-point scale, then **Submit**.
   - **Expected:** your **MBTI type**, **style name**, and four **clarity bars** are shown; the attempt is saved.
4. Retake as many times as you like — **every attempt is kept** in **Historical Results** with timestamps.

---

## 6. Review Past Results (Internal Employee)

- On `/employee`, the **Latest Result** card shows your most recent type/style and clarity bars.
- The **Historical Results** table lists every past attempt (timestamp, type, style), newest first.

---

## 7. HR Dashboard — Overall Results

1. Log in as `hr.exec@university.edu` → **HR Dashboard**.
   - **Expected:** every employee MBTI result shown as a row: Employee ID, Name, Department, MBTI Type, Style, Date.
2. **Filter by MBTI type** — type e.g. `ISTJ` (partial values work too). **Expected:** only matching rows.
3. **Filter by Employee ID** — type e.g. `2`. **Expected:** only that employee's rows.
4. Combine both filters, or **Clear filters** to reset.
5. **Click any row** → `/hr/employees/[id]`:
   - Full employee profile (ID, name, email, department, role, gender, DOB, registration date).
   - A full analysis card for **each** test attempt: MBTI type, style, letter breakdown, and all four clarity bars.
   - Employees with no attempts show "This employee has not taken the test yet."

---

## 8. Access Control (server-side RBAC)

RBAC lives in `src/lib/auth/rbac.ts` and is enforced inside every API handler — not just hidden in the UI.

| # | Who | Action | Expected |
|---|---|---|---|
| 1 | Not logged in | Any dashboard or API | Redirect/denied — login required |
| 2 | Internal Employee | `GET /api/hr/results` | 403 Forbidden |
| 3 | Internal Employee | `GET /api/hr/employees/[id]` | 403 Forbidden |
| 4 | Internal Employee | Submit test, view own history | ✓ Allowed |
| 5 | HR | View HR dashboard + employee details | ✓ Allowed |
| 6 | HR | Submit a test (own attempt) | ✓ Allowed |

---

## 9. Smoke-Test Checklist

- [ ] §2 Register employee + HR accounts
- [ ] §3 Login lands correctly per role; logout works
- [ ] §4 Learning content renders
- [ ] §5 Take test → result shown; retake → history grows
- [ ] §6 Past attempts listed newest first
- [ ] §7 HR dashboard rows + MBTI type / Employee ID filters + row click → full analysis
- [ ] §8 Employee gets 403 on HR endpoints
