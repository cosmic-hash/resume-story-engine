# Resume Story Engine

Resume Story Engine is a portable, file-backed preparation workflow and interactive dashboard for turning any résumé and job description into specific, evidence-backed interview stories. It works with any language model while keeping schemas, prompts, quality checks, assembly/validation scripts, and the dashboard contract in source control — and keeping all personal runs private under gitignored `data/private/`.

## What this repository contains

```text
spec/                 Required JSON schemas and field definitions
prompts/              Stage-specific prompts (including measurements & coach prompt)
examples/             Run folder layout notes
evals/                General-question bank and quality checks
data/                 Committed synthetic demo; personal runs stay in gitignored data/private/
dashboard/            Multi-run interactive dashboard (Mermaid flows, clickable Q&A, downloads)
scripts/              Assemble, validate, and local dashboard server scripts
.agents/skills/       Agent skill that runs and incrementally updates the staged pipeline
AGENTS.md             Always-on agent guardrails for this repo
```

## The pipeline

```text
Résumé + job description  (data/private/<run-slug>/00-inputs/)
        ↓
Compact role summary      (01-role-summary.json)
        ↓
Tech / domain landscape   (01b-tech-landscape.json — live web research)
  exact versions · tool tradeoffs · gaps · architectures · Product/UX norms · 2024+ AI tools · timeline checks
        ↓
Point index               (02-point-index.json — all bullets verbatim)
        ↓
For each point in order   (03-points/<id>.json — sequential, anti-repeat)
  deep JD match · exact versions · toolDecisions · Mermaid architecture · businessTerms · challenges · measurements · interviewerQA
        ↓
General & STAR answers    (04-answers.json)
        ↓
Review, assemble & study guide  (05-review.json → node scripts/assemble.mjs <run-slug> → 06-preparation.json + 07-study-guide.md)
        ↓
Interview coach prompt & round guides  (08-interview-coach-prompt.md + optional 09-*.md / *.html in the same run folder)
        ↓
Shared interactive dashboard    (npm run dashboard → http://localhost:4173/dashboard/?run=<run-slug>)
```

## Quick start (any résumé + job description)

1. Run `/resume-story` (or ask your agent to follow `.agents/skills/resume-story/SKILL.md`) with a résumé and job description.
2. All outputs land inside `data/private/<run-slug>/` (gitignored).
3. Whenever you add more real project context or round-specific prep later, update the files inside that **same** `data/private/<run-slug>/` folder and run:

```bash
node scripts/assemble.mjs <run-slug>
```

4. Launch the shared dashboard:

```bash
npm run dashboard
# opens http://localhost:4173/dashboard/ (auto-selects newest run + top-bar run switcher)
```

## Dashboard features

The dashboard is completely generic and automatically discovers every `data/private/<run-slug>/06-preparation.json` (plus the committed synthetic demo `data/instrumental-demo.json`):

- **Top-bar run switcher** to move between all local runs (`?run=<run-slug>`).
- **Live Mermaid architecture diagrams** rendered directly inside each résumé point.
- **Exact technology versions**, **Tool Decisions** (*Existing Stack Continuity* vs. *Technical Tradeoff*), **Business & Domain Terms**, **Challenges & Solutions**, **Measurements**, and **clickable Follow-Up Q&A cards**.
- **Per-run companion docs panel** automatically listing any extra `.md` / `.html` guides saved in `data/private/<run-slug>/` (study guide, coach prompt, round question banks, HTML sheets).
- **One-click downloads** right from the header: **`↓ MD`** (complete Markdown study guide), **`↓ HTML / PDF`** (all stories expanded + rendered Mermaid + Print/Save PDF), and **`↓ JSON`** (raw structured preparation).

## Validation & assembly

```bash
# Validate the committed synthetic demo
npm run validate

# Validate any private run directly
node scripts/validate.mjs data/private/<run-slug>/06-preparation.json

# Assemble 06-preparation.json + 07-study-guide.md and validate a private run
node scripts/assemble.mjs <run-slug>
```

## Privacy

`data/private/` is ignored in `.gitignore`. Personal résumés, job descriptions, private runs, company-specific notes, and API keys must never be committed to source control. The committed `data/instrumental-demo.json` is purely synthetic.
