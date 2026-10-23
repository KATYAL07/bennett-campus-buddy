# First PR Workshop: 15-Minute Live Demo Script 🎙️

> **Host:** Arnav Katyal (Tech Head, GDG On Campus at Bennett University)  
> **Audience:** 1st and 2nd year students at Bennett University attending Hacktoberfest  
> **Goal:** Take a complete beginner from zero to submitting their first merged Pull Request on GitHub in 15 minutes.

---

## Workshop Timeline Overview

| Minute | Segment | Focus |
|---|---|---|
| **0:00 - 2:00** | Introduction & The Big Picture | What is Open Source & Hacktoberfest? |
| **2:00 - 5:00** | Finding & Claiming Your Starter Issue | Navigating the Issues tab and assigning |
| **5:00 - 9:00** | Fork, Clone & Demo Mode Magic | Zero-secret local environment setup |
| **9:00 - 12:00** | Making the Fix & Committing | Branching, testing in browser, git commit |
| **12:00 - 15:00** | Opening the PR & Live Review | Submitting PR, CI checks, maintainer merge |

---

## Segment-by-Segment Facilitator Script

### Minute 0:00 - 2:00 | Introduction & The Big Picture
**[Projector on: Campus Buddy homepage running at campus-buddy.vercel.app]**

> *"Good evening everyone! Welcome to GDG On Campus Bennett University's Hacktoberfest kickoff.
> Many of you are in your first or second semester of engineering, and Git or GitHub might feel intimidating. Today, we're demystifying it completely.
>
> We built **Campus Buddy** specifically for Bennett students. It has class notes, exam papers, and club schedules. But here's the secret: **we intentionally left beginner-friendly starter flaws across the app.**
> Some are simple typos on a heading. Some are missing button labels or colors.
>
> You are going to fix these flaws, open real pull requests, and see your code merged live into production!"*

---

### Minute 2:00 - 5:00 | Finding & Claiming Your Issue
**[Projector on: `github.com/KATYAL07/campus-buddy/issues`]**

> *"Let's navigate to the repository on GitHub. Look at the **Issues** tab.
> Notice the labels:
> - `good first issue`: Ideal for your very first PR (takes < 5 minutes).
> - `easy`: Straightforward UI text or CSS tweak.
> - `medium`: Small logic or state handling fix.
>
> **Golden Rule of Hacktoberfest:** Never start coding without claiming the issue first!
> Scroll down to Issue #8: `'fix(docs): Fix typo 'Calender' on Events page heading'`.
>
> Click on it. In the comment box, type:
> `Hi @KATYAL07, I would love to work on this issue as my first PR!`
>
> As maintainer, I will assign the issue directly to your GitHub username. Once assigned, that issue is officially reserved for you."*

---

### Minute 5:00 - 9:00 | Fork, Clone & Demo Mode Setup
**[Projector on: Browser showing Fork button, then terminal]**

> *"Now, let's get the code onto your laptop:
>
> 1. In the top-right corner of the repo, click **Fork**. This makes a copy under your account.
> 2. Open your terminal or VS Code terminal, and clone your personal fork:
> ```bash
> git clone https://github.com/YOUR_USERNAME/campus-buddy.git
> cd campus-buddy
> ```
> 3. Now here is the best part: you don't need any database passwords or Google cloud accounts. We built **Demo Mode**.
> Run these two commands:
> ```bash
> npm install
> npm run dev
> ```
> 4. Open `http://localhost:3000`. The entire app is running locally with full in-memory student profiles and sample notes!"*

---

### Minute 9:00 - 12:00 | Making the Fix & Committing
**[Projector on: VS Code editor]**

> *"Now we follow proper Git hygiene:
>
> **Step 1: Create a feature branch.**
> ```bash
> git checkout -b fix-calendar-heading-typo
> ```
>
> **Step 2: Make the code change.**
> Open `app/events/page.js` in VS Code.
> Look at line 14:
> ```jsx
> <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
>   Campus Events & Calender
> </h1>
> ```
> Change `Calender` to `Calendar`. Save the file.
> Look at your browser: Next.js hot-reloads instantly. The typo is fixed!
>
> **Step 3: Run the build check.**
> ```bash
> npm run lint
> npm run build
> ```
> Both pass with zero errors.
>
> **Step 4: Commit and push.**
> ```bash
> git add app/events/page.js
> git commit -m "fix(docs): correct 'Calender' typo in events header"
> git push -u origin fix-calendar-heading-typo
> ```"*

---

### Minute 12:00 - 15:00 | Submitting the Pull Request
**[Projector on: GitHub repo page]**

> *"Head back to GitHub. You'll see a green button: **'Compare & pull request'**. Click it!
>
> 1. In the title, write: `fix(docs): correct 'Calender' typo in events header`
> 2. In the description, link your issue: `Fixes #8`
> 3. Check the contributor checklist boxes.
> 4. Click **Create Pull Request**.
>
> Watch what happens immediately:
> - Our automated GitHub Actions CI spins up.
> - It installs dependencies, verifies the build, and runs Gitleaks to make sure no secrets were leaked.
> - Once CI turns green, as the maintainer, I review your code, click **Approve**, and hit **Squash and Merge**.
>
> Congratulations! You are now an official open-source contributor to Campus Buddy and on the Hacktoberfest leaderboard!"*

---

## Troubleshooting Quick-Reference for Helpers

* **Issue: "git: command not found"**  
  *Help:* Install Git from [git-scm.com](https://git-scm.com) and restart terminal.
* **Issue: "npm error ERESOLVE unable to resolve dependency tree"**  
  *Help:* Run `npm install --legacy-peer-deps`.
* **Issue: Student pushed to `main` on fork instead of a feature branch**  
  *Help:* Show them `git checkout -b my-feature-branch` and explain why branches keep `main` clean.
* **Issue: PR shows merge conflict**  
  *Help:* `git fetch upstream && git rebase upstream/main`, resolve in VS Code, and `git push -f origin my-feature-branch`.
