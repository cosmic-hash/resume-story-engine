# Resume Story Engine

Resume Story Engine is a portable preparation workflow for turning a résumé and job description into specific, evidence-backed interview stories. It is designed to work with different language models while keeping the rules, output shape, quality checks, and dashboard contract in source control.

## What this repository contains

```text
spec/                 Required output shapes and field definitions
prompts/              Small stage-specific prompts for any LLM adapter
examples/             Layout notes and expected detail level
evals/                Quality checks and test cases
data/                 Safe demo output; keep personal runs private
dashboard/            Read-only browser dashboard for preparation JSON
scripts/              Validation and local preview helpers
.cursor/skills/       Cursor skill that runs the staged pipeline
AGENTS.md             Short always-on agent gates for this repo
```

## The pipeline

```text
Résumé + job description
        ↓
Compact role summary
        ↓
Tech / domain landscape research (web)
  versions · gaps · architectures · Product/UX norms · 2024+ AI tools · timeline checks
        ↓
Point index (all bullets, compact)
        ↓
For each point in order (automated):
   load landscape + prior points → expand with versions, architecture, collab, AI hints → write file
        ↓
Generate general + STAR bank answers (~60s intro; modern AI / teamwork questions)
        ↓
Review, assemble preparation JSON, validate
        ↓
Optional: clear intermediate checkpoints
        ↓
Render the preparation dashboard
```

Points are expanded **sequentially**. Each new point receives the landscape brief and prior stories so the same company prep stays specific, timeline-plausible, and non-repetitive. Checkpoint files under `data/private/<run-slug>/` are the handoff between stages — see `examples/run-layout.md`.

## Using Cursor (default runner)

1. Open this repo in Cursor.
2. In Agent chat, run `/resume-story` (or ask to prepare interview stories) and paste the résumé + job description.
3. The skill writes stage files automatically and continues point-by-point without waiting for "next".
4. When finished, open `data/private/<run-slug>/06-preparation.json`.
5. Say `clear` to delete intermediates and keep inputs + final JSON.

Point-level rewrite/edit is planned next; this pass focuses on full generate.

## Using another LLM

An agent adapter should load `spec/`, the relevant prompt in `prompts/`, and one or more examples from `examples/`. It then supplies the résumé, job description, and company context as tagged inputs and asks for JSON matching the preparation schema. The model is not expected to remember this repository; the adapter explicitly loads the versioned rules.

Use structured output or JSON schema enforcement when the provider supports it. After generation, run `npm run validate` and the quality checks before storing the result. If a record is incomplete, send only the failed fields back for repair instead of regenerating the entire preparation.

## Dashboard

The dashboard is provider-independent. It renders `data/instrumental-demo.json`, and the same shape can be replaced with any generated preparation:

```bash
npm run dashboard
# open http://localhost:4173/dashboard/
```

## Validation

```bash
npm run validate
```

The validator checks required fields, point identifiers, measurement fields, answer structure, and the final quality checklist. It does not claim that a number is factually true; evidence still needs to be reviewed by the candidate.

## Privacy

Keep personal résumés, job descriptions, notes, API keys, and generated private answers outside the public repository or under ignored paths. The committed demo is synthetic and contains no personal source documents.
