# Campus Buddy - Organizer & Maintainer Deployment Guide 📘

> **For:** Arnav Katyal (Tech Head, GDG On Campus Bennett University)  
> **Purpose:** Click-by-click setup and operations manual for hosting Campus Buddy for Hacktoberfest.  
> **Note on UI Changes:** Cloud dashboards (Supabase, Google Cloud, Vercel, GitHub) periodically rename menus or rearrange settings tabs. When following these steps, look for the underlying functional term (e.g. "OAuth Consent", "Environment Variables", "SQL Editor") if the exact wording differs slightly.

---

## Assumptions & Design Decisions

Because you requested minimal manual friction and full autonomy, the following design decisions and assumptions have been baked into the architecture:
1. **Zero-Secret Demo Mode:** Default local development requires zero environment variables, zero database instances, and zero Google cloud keys. The app boots in-memory and passes all CI/build checks out of the box.
2. **Preview Safety on Vercel:** By placing Supabase credentials strictly in Vercel's **Production** environment, every pull request opened by student contributors generates a Vercel Preview deployment running safely in **In-Memory Demo Mode**. Contributors can never reach or pollute your real student database.
3. **Database Security Model (RLS):** Row Level Security is active on every single table with **no public policies**. The Supabase public anon key cannot query or insert anything directly from client code. All interactions route through server-side Route Handlers utilizing the secure `SUPABASE_SERVICE_ROLE_KEY`.
4. **Bennett Email Verification:** Server-side domain enforcement validates student email addresses during the OAuth callback. If `ALLOWED_EMAIL_DOMAIN` is set to `bennett.edu.in`, any attempt to sign in with an external Gmail account immediately triggers an automated sign-out and error redirection.
5. **Direct Storage Uploads:** File uploads for notes/PYQs upload directly to Supabase Storage using time-limited signed upload URLs generated server-side, bypassing Vercel's 4.5 MB serverless request body limitation.
6. **No Vibe-Coding Aesthetics:** Clean, structured card layout using forest green, warm amber, and brick red accents; sharp corners and standard rectangular buttons (no pill buttons); high readability; zero emoji icons; zero em dashes.

---

## 1. Supabase Project Setup & Database Migration

1. Navigate to [database.new](https://database.new) or sign in to [supabase.com](https://supabase.com).
2. Click **New Project**.
   - **Name:** `campus-buddy`
   - **Database Password:** Generate a secure password and save it in your password manager.
   - **Region:** Select `South Asia (Mumbai) [ap-south-1]` (lowest latency for Bennett University in Greater Noida).
   - Click **Create new project** and wait ~2 minutes for provisioning.
3. In the left navigation menu, click **SQL Editor** (icon looking like `>_`).
4. Click **New query** (or `+`).
5. Open `supabase/schema.sql` from this repository, copy all contents, paste into the query window, and click **Run** (or `Ctrl+Enter`).
   - *Confirmation:* Verify that the message says `Success. No rows returned`.
6. Click **New query** again, open `supabase/seed.sql`, paste the contents, and click **Run**.
   - *Confirmation:* Verify that sample rows for profiles, posts, events, and help requests are created.
7. In the left menu, click **Table Editor** to confirm you see the tables: `profiles`, `posts`, `post_upvotes`, `events`, `rsvps`, `help_requests`, `help_replies`, `chat_messages`, `reports`.
8. In the left menu, click **Storage**. Confirm the bucket `posts` exists and is marked **Private**.
9. In the left menu, click **Project Settings** (gear icon) -> **API**.
   - Copy **Project URL** (e.g., `https://abcdefghijkl.supabase.co`).
   - Copy **anon public key**.
   - Copy **service_role secret key** (reveal secret).

---

## 2. Google Cloud OAuth Client Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top project dropdown, click **New Project**. Name it `Bennett Campus Buddy` and click **Create**.
3. In the left navigation menu, go to **APIs & Services** -> **OAuth consent screen** (or search "OAuth consent").
   - **User Type:** Select **External** and click **Create**.
   - **App name:** `Campus Buddy`
   - **User support email:** `arnav@bennett.edu.in`
   - **Developer contact information:** `arnav@bennett.edu.in`
   - Click **Save and Continue**.
   - Under **Scopes**, click **Add or Remove Scopes**. Select `.../auth/userinfo.email` and `.../auth/userinfo.profile`. Click **Update** -> **Save and Continue**.
   - Under **Test users** (if in Testing mode), add your personal Bennett email. Then click **Save and Continue**.
4. In the left menu, click **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - **Application type:** `Web application`
   - **Name:** `Campus Buddy Web Client`
   - **Authorized redirect URIs:**
     - Go back to your Supabase Dashboard -> **Authentication** -> **Providers** -> **Google**.
     - Find the field labelled **Callback URL (for OAuth)** (e.g. `https://your-project.supabase.co/auth/v1/callback`).
     - Copy this URL and paste it into Google Cloud's **Authorized redirect URIs** box.
   - Click **Create**.
5. A popup will show your **Client ID** and **Client Secret**.
6. Switch back to your Supabase Dashboard -> **Authentication** -> **Providers** -> **Google**:
   - Toggle **Enable Google provider** to ON.
   - Paste the **Client ID**.
   - Paste the **Client Secret**.
   - Click **Save**.

---

## 3. Supabase Auth URL Configuration

1. In Supabase Dashboard, go to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your future Vercel production domain:
   - Example: `https://campus-buddy-gdg.vercel.app` (or your initial custom domain).
3. Under **Redirect URLs**, click **Add URL** and add:
   - `http://localhost:3000/**` (for local development testing)
   - `https://*.vercel.app/**` (allows preview branch deployments to redirect safely)
4. Click **Save**.

---

## 4. Vercel Import & Production Environment Setup

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Locate `KATYAL07/campus-buddy` in your repository list and click **Import**.
4. In the **Configure Project** screen:
   - **Framework Preset:** Next.js (automatically detected)
   - **Root Directory:** `./`
5. Expand the **Environment Variables** section. Add the following variables:

| Variable Name | Value | Environment Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | **Production ONLY** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | **Production ONLY** |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | **Production ONLY** |
| `NEXT_PUBLIC_APP_URL` | `https://campus-buddy-gdg.vercel.app` | **Production ONLY** |
| `ADMIN_EMAILS` | `arnav@bennett.edu.in,techhead@bennett.edu.in` | **Production ONLY** |
| `ALLOWED_EMAIL_DOMAIN` | `bennett.edu.in` | **Production ONLY** |

> **CRITICAL ARCHITECTURAL STEP:**  
> When adding each variable in Vercel, uncheck **Preview** and **Development**.  
> Leave ONLY **Production** checked!  
> This ensures that every student's PR preview deployment automatically boots into **In-Memory Demo Mode**, preventing accidental data leaks, unauthorized database modifications, or invalid Google auth callbacks!

6. Click **Deploy**. Vercel will build and deploy the production site in ~90 seconds.

---

## 5. Running the GitHub Automation Script

1. Open your local terminal in the project directory.
2. Ensure you are logged into the GitHub CLI:
   ```bash
   gh auth status
   ```
3. Run the setup script:
   ```bash
   bash scripts/setup-github.sh
   ```
   *What this script does:*
   - Adds the official `hacktoberfest` topic to your repository.
   - Creates all necessary issue labels (`good first issue`, `ui`, `bug`, `feature`, `docs`, `accessibility`).
   - Automatically imports all 47 starter flaws from `.github/starter-issues.json` as individual open GitHub issues ready for students to claim!

---

## 6. Verifying Branch Protection on `main`

1. Open your repository on GitHub: `https://github.com/KATYAL07/campus-buddy/settings/branches`.
2. Click **Add branch protection rule** (or edit rule for `main`):
   - **Branch name pattern:** `main`
   - Check **Require a pull request before merging**
     - Require approvals: `1`
   - Check **Require status checks to pass before merging**
     - Search and select `Install, Lint & Build (Demo Mode)` and `Gitleaks Secret Detection`
   - Check **Do not allow force pushes**
   - Check **Do not allow deletions**
   - Uncheck **Do not allow bypassing the above settings** (or do NOT check enforce for administrators), so you as maintainer retain administrative control to merge emergency hotfixes.
3. Click **Create** / **Save changes**.

---

## 7. Hacktoberfest Official Compliance Checklist

* [ ] **Repository Topic:** Verify that `hacktoberfest` is present in the repository's "About" topics on the GitHub main page.
* [ ] **Official Rules Verification:** Hacktoberfest organizers adjust participation guidelines periodically. Visit [hacktoberfest.com](https://hacktoberfest.com) prior to Day 1 to confirm current registration deadlines and PR counting rules.
* [ ] **Labeling Approved PRs:** Once a student's PR is reviewed and accepted, apply the label `hacktoberfest-accepted` to the PR before merging.
* [ ] **Spam Protection:** If an automated or low-effort AI submission is received, immediately close it and label it `spam` or `invalid`. This disqualifies the abusive account from Hacktoberfest.
* [ ] **Prompt Merges:** Aim to merge or request changes on all PRs within 24 hours to keep students motivated!

---

## 8. Reviewer Roster & Response Time Plan

| Role | Person | Primary Focus | Target Response Time |
|---|---|---|---|
| **Lead Maintainer** | Arnav Katyal | Core logic, admin routes, final approvals | < 12 hours |
| **Reviewer 1 (GDG Lead)** | Student Senior 1 | Documentation, text typos, markdown fixes | < 6 hours |
| **Reviewer 2 (GDG Lead)** | Student Senior 2 | UI styling, responsive layout, CSS tweaks | < 6 hours |

**PR Review Workflow:**
1. Check that CI (Build & Gitleaks) passed.
2. Verify that the contributor claimed the issue first.
3. Check the code diff in the "Files changed" tab for any committed secrets or unrelated edits.
4. If approved: Comment *"Great work! Approved for Hacktoberfest."*, apply `hacktoberfest-accepted`, and click **Squash and Merge**.

---

## 9. Pre-Event Smoke Test Checklist

Perform this 5-minute sanity check 24 hours before your event:
* [ ] **Fresh Clone in Demo Mode:**
  ```bash
  git clone https://github.com/KATYAL07/campus-buddy.git test-campus-buddy
  cd test-campus-buddy
  npm install
  npm run dev
  ```
  Verify the app loads at `localhost:3000` with the yellow "Demo Mode Active" banner.
* [ ] **Test Production Login:** Visit your live Vercel URL. Click "Sign in with Google". Confirm your Bennett email signs in and loads your profile.
* [ ] **Test Production Upload:** Publish a PDF note on the Study Feed. Confirm the signed URL upload succeeds and the document is accessible.
* [ ] **Test Campus Lounge:** Post a message in `/chat`. Confirm it appears and updates on other browser windows within 5 seconds.
* [ ] **Test Report & Admin Delete:** Sign in as an admin (`arnav@bennett.edu.in`). Go to `/admin`. Confirm you can resolve reports and delete items.

---

## 10. Database Reset & Key Rotation Procedures

### Emergency Database Reset
If test data during practice clutters the database or corrupts records:
```bash
npm run db:reset
```
*Note:* The script strictly requires typing the confirmation phrase `RESET-CAMPUS-BUDDY` to prevent accidental execution.

### Rotating a Leaked Secret
If a developer or student accidentally commits a service role key:
1. Open Supabase Dashboard -> **Project Settings** -> **API**.
2. Scroll to **Project API keys** and click **Reset key** next to `service_role`.
3. Immediately update the new key in your **Vercel Project Settings** under Environment Variables.
4. Trigger a **Redeploy** on Vercel.

---

## 11. Event-Day Timeline (Sample 3-Hour Hackathon)

* **00:00 - 00:20:** Welcome & Overview of Hacktoberfest (Why Open Source matters).
* **00:20 - 00:35:** Live First PR Demo (Follow `docs/FIRST_PR_WORKSHOP.md`).
* **00:35 - 00:50:** Students browse Issues tab, comment on starter issues, and receive assignments.
* **00:50 - 02:30:** Open Hacking! Mentors walk around helping students with Git branching and merge conflicts.
* **02:30 - 02:50:** Live review and merging of student PRs on the big screen!
* **02:50 - 03:00:** Wrap-up, certification announcement, and group photo.
