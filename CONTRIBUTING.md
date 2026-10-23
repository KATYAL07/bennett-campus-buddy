# Contributing to Campus Buddy 🚀

Welcome to the **Campus Buddy** open source project for **Hacktoberfest 2026** at Bennett University! We are excited to help first- and second-year students make their very first open-source pull requests.

---

## Important Rules for Contributors

To ensure a fair, educational, and smooth Hacktoberfest experience, please read and follow these rules:

1. **Comment and Get Assigned First:** Browse the repository [Issues](https://github.com/KATYAL07/campus-buddy/issues). Find an issue you want to solve, leave a polite comment expressing your interest, and **wait until a maintainer formally assigns you** to the issue before writing code. Do not open PRs for issues assigned to other students.
2. **One Issue per Pull Request:** Keep your pull requests small and focused on a single issue. Do not combine multiple unrelated fixes into one PR.
3. **Your Own Work Only:** All commits must be written by you. Copy-pasted PRs, automated AI spam submissions, and whitespace-only edits will be closed, flagged with the `spam` / `invalid` label, and disqualified from Hacktoberfest.
4. **Zero Secrets Required:** You do **NOT** need any API keys or secrets to develop locally. The app runs completely in-memory in Demo Mode! **NEVER commit any `.env`, `.env.local`, or secret tokens.** Any PR containing secrets will be rejected immediately.
5. **Screenshots for UI Changes:** If your pull request modifies any visible user interface component, you **must attach a before/after screenshot** to your pull request description.

---

## Step-by-Step Contribution Workflow

Follow these exact steps from your computer terminal:

### Step 1: Fork the Repository
Click the **Fork** button in the top-right corner of the [Campus Buddy repository](https://github.com/KATYAL07/campus-buddy). This creates a copy under your personal GitHub profile (`github.com/YOUR_USERNAME/campus-buddy`).

### Step 2: Clone Your Fork
Open your terminal (PowerShell, Git Bash, or Terminal) and clone your fork to your computer:
```bash
git clone https://github.com/YOUR_USERNAME/campus-buddy.git
cd campus-buddy
```

### Step 3: Set Up the Upstream Remote
Connect your local clone to the main repository so you can sync updates:
```bash
git remote add upstream https://github.com/KATYAL07/campus-buddy.git
```

### Step 4: Create a New Git Branch
Never make changes directly on your `main` branch. Create a feature branch named after your issue:
```bash
# Example for issue #8 (typo in events heading)
git checkout -b fix-events-heading-typo
```

### Step 5: Run the Project in Demo Mode
Install dependencies and run the development server with zero configuration:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to verify that the app runs.

### Step 6: Make Your Changes
Open the project in VS Code:
```bash
code .
```
Find the file specified in your assigned issue (e.g., `app/events/page.js`), make your fix, and save the file. Check your browser to verify that the fix works!

### Step 7: Verify Linting and Build
Before committing, make sure the project builds without errors:
```bash
npm run lint
npm run build
```
Both commands must complete successfully.

### Step 8: Commit Your Changes
Stage your modified files and write a clear, descriptive commit message following the Conventional Commits format:
```bash
git add app/events/page.js
git commit -m "fix(docs): correct 'Calender' typo in events header"
```

### Step 9: Push to Your Fork
Push your branch to your GitHub fork:
```bash
git push -u origin fix-events-heading-typo
```

### Step 10: Open Your Pull Request
1. Go to the original [Campus Buddy repository](https://github.com/KATYAL07/campus-buddy).
2. You will see a banner saying *"fix-events-heading-typo had recent pushes"*. Click **Compare & pull request**.
3. Fill out the pull request template:
   - Link your issue: `Fixes #8`
   - Describe what changed
   - Attach a screenshot if you updated the UI
4. Click **Create pull request**.

Maintainers will review your PR within 24 hours. If changes are requested, simply push new commits to your branch and the PR will update automatically!
Once approved and merged, your PR will count toward your Hacktoberfest goals!
