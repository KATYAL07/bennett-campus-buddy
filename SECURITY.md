# Security Policy

## Reporting Security Issues & Vulnerabilities

The security and privacy of Bennett University students using Campus Buddy is our highest priority. If you discover a security vulnerability or security bug, **do NOT create a public GitHub issue.**

Please report all security concerns directly and confidentially to:
* **Maintainer:** Arnav Katyal (Tech Head, GDG On Campus Bennett University)
* **Email:** [arnav@bennett.edu.in](mailto:arnav@bennett.edu.in)

Please include:
1. A clear description of the vulnerability (e.g. CSRF, rate-limit bypass, SQL injection, unauthorized access).
2. Step-by-step instructions to reproduce the issue.
3. Potential impact on student accounts or university systems.

We commit to acknowledging your disclosure within 24 hours and releasing a fix before public disclosure.

---

## Strict Rule: Never Commit Secrets

* Never commit `.env` files, API keys, Google OAuth client secrets, or Supabase Service Role keys to Git.
* The repository is continuously protected by automated **Gitleaks** secret-scanning in our CI pipeline. Any pull request containing detected secrets will be immediately blocked and closed.
* In local development, Campus Buddy functions completely in **In-Memory Demo Mode** without requiring any secrets.
