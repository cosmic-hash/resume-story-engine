# Private run layout

Personal runs are never committed (`data/private/` is gitignored). Create and incrementally update each run inside its own folder under `data/private/<run-slug>/`:

```text
data/private/<run-slug>/
  00-inputs/resume.md
  00-inputs/job.md
  01-role-summary.json
  01b-tech-landscape.json
  02-point-index.json
  03-points/<point-id>.json
  04-answers.json
  05-review.json
  06-preparation.json
  07-study-guide.md
  08-interview-coach-prompt.md
  09-*.md / *.html           # optional round-specific guides & question banks
  _progress.json
```

- `01b-tech-landscape.json` holds researched framework purpose/gaps, exact versions by era, tool tradeoffs, collaboration norms, post-2024 AI tooling norms, and résumé timeline checks.
- `03-points/<point-id>.json` holds expanded stories with Mermaid diagrams (`architecture.mermaid`), `toolDecisions`, `businessTerms`, `challenges`, `measurements`, and `interviewerQA`.
- Run `node scripts/assemble.mjs <run-slug>` after generating or editing points to rebuild `06-preparation.json`, regenerate `07-study-guide.md`, and run schema validation.
- Start `npm run dashboard` and open `http://localhost:4173/dashboard/?run=<run-slug>` — the shared dashboard automatically discovers every run under `data/private/` and surfaces any extra `.md`/`.html` guides stored in that run folder.
- Say `clear` to drop intermediate checkpoints (`01`–`05`, `01b`, `03-points/`, `_progress.json`) while keeping `00-inputs/`, `06-preparation.json`, `07-study-guide.md`, `08-interview-coach-prompt.md`, and extra round guides.
