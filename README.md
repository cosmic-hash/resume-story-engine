# Resume Story Engine

Resume Story Engine is a portable preparation workflow for turning a résumé and job description into specific, evidence-backed interview stories. It is designed to work with different language models while keeping the rules, output shape, quality checks, and dashboard contract in source control.

## What this repository contains

```text
spec/       Required output shapes and field definitions
prompts/    Small stage-specific prompts for any LLM adapter
examples/   High-quality examples that teach the expected level of detail
evals/      Quality checks and test cases
data/       Safe demo output; keep personal preparation data private
dashboard/  Read-only browser dashboard for preparation JSON
scripts/    Validation and local preview helpers
```

## The pipeline

```text
Résumé + job description
        ↓
Compact role summary
        ↓
Compact résumé-point cards
        ↓
Five to ten plausible situations per point
        ↓
Rank the strongest role-aligned situation
        ↓
Expand product, workflow, technology, impact, and evidence
        ↓
Generate CTAR and general interview answers
        ↓
Run structural and quality evaluation
        ↓
Save as draft, reviewed, or finalized
        ↓
Render the preparation dashboard
```

The compact cards are an index, not a replacement for the full story. Detailed facts remain in the preparation record and are loaded only when a point is expanded.

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
