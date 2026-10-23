# Campus Buddy 🎓

> **Bennett University Student Collaboration & Resource Portal**  
> Maintained by **Arnav Katyal** (Tech Head, GDG On Campus at Bennett University).  
> Built for Bennett University students participating in **Hacktoberfest 2026**.

[![CI](https://github.com/KATYAL07/campus-buddy/actions/workflows/ci.yml/badge.svg)](https://github.com/KATYAL07/campus-buddy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2026-amber.svg)](https://hacktoberfest.com)

---

## What is Campus Buddy?

Campus Buddy is a college hub designed specifically for Bennett University students. It provides:
1. **Personalized Dashboard:** Live greeting, upcoming GDG events, top peer-recommended resources, and campus help requests.
2. **Study Feed:** An Instagram-style feed for course notes, solved Previous Year Questions (PYQs), lab walkthroughs, and lecture video links. Filterable by branch (CSE, ECE, ME, Civil, BBA) and semester (1-8).
3. **Campus Events & Calendar:** Up-to-date schedule of GDG On Campus sessions, hackathons, and technical society workshops with one-click RSVP.
4. **Peer Help Board:** A student-to-student troubleshooting forum for coding bugs, lab circuits, and exam doubts.
5. **Campus Lounge:** A single, global, live text-only chat room with built-in rate-limiting and community moderation.
6. **Useful Contacts Directory:** Static campus telephone directory for academic departments, hostels, IT helpdesk, and 24x7 security.

---

## Quick Start (3 Commands)

Campus Buddy features a built-in **In-Memory Demo Mode**. You do **NOT** need any API keys, Supabase credentials, or Google OAuth secrets to run, test, and contribute to this project locally!

```bash
# 1. Clone your fork of the repository
git clone https://github.com/YOUR_USERNAME/campus-buddy.git
cd campus-buddy

# 2. Install dependencies
npm install

# 3. Start the local development server in demo mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser. You can click **"Switch Demo Student"** in the top yellow banner to explore the app as different student personas or as the administrator!

---

## Project Structure Map

```text
campus-buddy/
├── app/                  # Next.js App Router pages and Route Handlers
│   ├── admin/            # Moderator review dashboard (/admin)
│   ├── api/              # Secure server-side REST API route handlers
│   │   ├── auth/         # Demo session and sign-out endpoints
│   │   ├── chat/         # Campus Lounge polling and message API
│   │   ├── events/       # Events listing and RSVP endpoints
│   │   ├── help/         # Peer help board requests and replies
│   │   ├── posts/        # Study feed posts and upvotes
│   │   ├── profile/      # User profile retrieval and updates
│   │   ├── reports/      # Content moderation reporting API
│   │   └── upload/       # Supabase Storage signed upload URL generator
│   ├── chat/             # Campus Lounge single-room chat UI (/chat)
│   ├── contacts/         # Useful contacts directory page (/contacts)
│   ├── events/           # Campus events listing & detail page (/events)
│   ├── feed/             # Study feed & material sharing UI (/feed)
│   ├── help/             # Peer help board UI (/help)
│   ├── onboarding/       # First-login branch and semester setup (/onboarding)
│   ├── privacy/          # Privacy policy page (/privacy)
│   ├── u/[id]/           # Student profile & authored posts page (/u/[id])
│   ├── globals.css       # Clean Tailwind styling and button tokens
│   └── layout.js         # Root layout with responsive Navbar and Footer
├── components/           # Reusable UI components (Navbar, PostCard, ReportModal)
├── data/
│   ├── contacts.json     # Static placeholder contacts directory
│   └── seed/             # JSON datasets loaded automatically in Demo Mode
├── docs/                 # Hacktoberfest guides and organizer walkthroughs
│   ├── FIRST_PR_WORKSHOP.md  # 15-minute live teaching demo script
│   └── ORGANIZER_GUIDE.md    # Complete click-by-click maintainer deployment manual
├── lib/                  # Core abstractions and utilities
│   ├── auth.js           # Dual demo / Supabase session manager
│   ├── config.js         # Single source of truth for app branding and options
│   ├── db.js             # Unified data-access layer (Supabase + In-Memory)
│   ├── rate-limit.js     # Server-side in-memory write rate limiter
│   └── validate.js       # Input sanitization and plain-text enforcement
├── scripts/
│   ├── reset-db.mjs      # Emergency database reset script (npm run db:reset)
│   └── setup-github.sh   # Automation script to create labels and starter issues
├── supabase/
│   ├── schema.sql        # Production PostgreSQL schema with full RLS
│   └── seed.sql          # Sample production data for Supabase SQL Editor
└── .github/              # Issue templates, PR template, CI workflows, starter issues
```

---

## Beginner Glossary

If this is your first time contributing to an open-source project, welcome! Here are the core concepts you need to know:

* **Repository (Repo):** The project folder containing all the code, assets, and history hosted on GitHub.
* **Fork:** A personal copy of someone else's repository on your own GitHub account that lets you freely make changes without affecting the original project.
* **Clone:** Downloading a repository from GitHub onto your local computer so you can edit it in your code editor (like VS Code).
* **Branch:** A separate workspace in Git where you can work on a specific feature or bugfix without touching the `main` branch.
* **Commit:** A saved snapshot of the changes you have made, accompanied by a descriptive message.
* **Pull Request (PR):** A request you submit asking the project maintainer (Arnav) to review and merge your branch's commits into the main repository.
* **Environment Variable (env var):** Configuration values (such as secret keys or database URLs) stored outside the codebase so that secrets are never published.

---

## Contributing to Campus Buddy

We welcome all Bennett University students, especially first- and second-year developers!  
Check out our detailed guide in [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to claim an issue, create a branch, and submit your pull request.

<!-- Planted flaw for Issue #16: Typo in section heading and incomplete bullet -->
### Supabse Local Development Setup (Optional)
If you wish to connect Campus Buddy to a real Supabase instace instead of running in Demo Mode:
1. Copy `.env.example` to `.env.local`
2. Populate `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. 

---

## License

This project is licensed under the [MIT License](LICENSE).
