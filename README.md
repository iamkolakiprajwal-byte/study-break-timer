# Study Break Timer ⏱️🌱
> **Focus with ease &bull; Rest with purpose**

A full-stack, responsive, student-centered productivity web application built with **Next.js 14, React 18, TypeScript, and Tailwind CSS**. Designed to help students start studying, maintain uninterrupted focus, take planned restorative breaks, and recognize their progress without guilt.

---

## 📸 Design Inspiration & Screens

Engineered from the ground up matching the three design references with a clean visual identity:

1. **Screen 1 — Welcome & Authentication (`AuthScreen.tsx`)**:
   - Stopwatch brand icon and warm greeting.
   - Segmented toggle between **Sign In** and **Sign Up**.
   - Email and password inputs with a password visibility toggle.
   - "Forgot password?" modal workflow.
   - "Continue with Google" OAuth button.
   - Zero-friction **"Explore as Guest"** option with an honest **Local Demo Mode** banner explaining local storage vs cloud sync.

2. **Screen 2 — Main Timer (`TimerScreen.tsx`)**:
   - Header with compact brand mark, personalized greeting, quick profile avatar shortcut, and today's session summary.
   - Optional, editable study task field (e.g., *"Review Biology Chapter 2"*).
   - Presets for **15m, 25m (Pomodoro), 30m, 45m, 60m** plus a modal for **Custom Durations** (1 - 180 min).
   - High-contrast digital countdown (`MM:SS` or `HH:MM:SS`) encased in an SVG circular progress ring with smooth stroke animation.
   - State badges: *Ready*, *Focusing Active*, *Paused*, *Focus Completed*, *Break in Progress*, *Break Paused*, *Break Completed*.
   - Start, Pause, Resume, and Reset controls with a safety confirmation dialog to prevent accidental progress loss.
   - Restorative break suggestions: *Drink water*, *Rest eyes (20-20-20 rule)*, *Stretch neck/shoulders*, *Stand up & walk*, *Take deep breaths*.
   - Procedural Web Audio API sound chime (no external MP3 downloads required, completely muteable).
   - Confetti burst celebration on focus session completion.

3. **Screen 3 — Profile & Session History (`ProfileScreen.tsx`)**:
   - User initials avatar, display name, email, and "Edit Profile & Defaults" button.
   - Dynamic metrics calculated from real stored records: **Total Focused Hours**, **Completed Sessions**, **Today's Minutes**, and **This Week's Hours**.
   - Chronological session list displaying task titles, exact dates, durations, and completion status.
   - Time filters: **All**, **Today**, **This Week**.
   - Empty state encouragement for first-time users.
   - Clear History option with destructive confirmation dialog.
   - Secure Sign Out flow.

---

## 🎨 Visual Design System

- **Primary Blue:** `#2878E8` (Primary buttons, selected duration presets, progress accents)
- **Dark Navy:** `#14233D` (Typography, icons, strong brand contrasts)
- **Secondary Blue:** `#8ABEFF` (Subtle highlights, secondary actions)
- **Main Background / Cards:** `#FFFFFF`
- **Soft Background:** `#F5F7FA` (Neutral contrast and form containers)
- **Main Text:** `#17243B`
- **Secondary Text:** `#68758A`
- **Borders:** `#D8DEE8`
- **Success:** `#24865B` (Break indicators, completion notifications)
- **Error:** `#D64545` (Validation, reset alerts)

---

## ⚙️ Architecture & Reliability

- **Timestamp-Based Accuracy**: Avoids browser timer throttling when tabs are switched or backgrounded by calculating remaining time against target end timestamps (`Date.now()`).
- **Interruption Recovery**: Active timer sessions are mirrored to `storageService`. If the page is refreshed or browser restarts, the timer calculates exact elapsed time and either resumes or completes faithfully.
- **Single-Record Integrity**: Multi-trigger guards (`hasCompletedRef`) ensure completed sessions are recorded exactly once. Abandoned sessions are not counted towards completed totals.
- **Clean Backend Abstraction**: Runs 100% out of the box in Local Storage mode without paid services or credentials. Supabase Auth and PostgreSQL can be connected simply by adding environment variables.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Navigate to project directory
cd /Users/prajwalkolaki/.gemini/antigravity/scratch/study-break-timer

# 2. Run the verification test suite
npm test

# 3. Start development server
npm run dev
# or build & run production:
npm run build && npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Cloud Backend Setup (Optional: Supabase)

To enable multi-device sync and genuine Google OAuth:

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in Supabase and run the provided [`supabase_schema.sql`](./supabase_schema.sql) file. This sets up:
   - `profiles` table with automatic user creation trigger.
   - `study_sessions` table with indexes.
   - Row Level Security (RLS) policies guaranteeing users can only read/write their own records.
4. Copy your project credentials into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
5. *(For Google OAuth)*: In Supabase Dashboard -> Authentication -> Providers -> Google, paste your Google Cloud OAuth Client ID & Secret, and set the authorized redirect URI to `https://<your-project-id>.supabase.co/auth/v1/callback`.

---

## 🚢 Deployment to Vercel

1. Push this directory to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Study Break Timer"
   git branch -M main
   git remote add origin https://github.com/<your-username>/study-break-timer.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `study-break-timer` repository.
4. (Optional) Add your Supabase environment variables in the Vercel dashboard.
5. Click **Deploy**. Vercel will build and serve your app globally on their Edge network.
