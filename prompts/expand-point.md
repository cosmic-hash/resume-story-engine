# Expand one résumé point

Read one résumé point, the compact role summary, the tech landscape brief (`01b-tech-landscape.json`), company context, and any `priorPoints` already expanded for this same target role. Return only JSON matching `spec/resume-point.schema.json`.

**Architecture belongs on this résumé point only** — never on general interview answers.

## Highest priority: deep job-description match

Be extremely specific about how **this** bullet maps to the target JD before polishing storytelling:

1. Fill `jdAlignment` with concrete JD hooks (`responsibility`, `userWorkflow`, `businessProblem`, `evaluationSignal`, `technology`, or `interviewTheme`) quoting or paraphrasing the JD closely.
2. Choose the situation that best mirrors the JD’s users, workflows, and evaluation signals — not the flashiest unrelated story.
3. In `roleConnection`, name the exact JD responsibility/workflow this point rehearses. Vague “this shows ownership” is not enough.
4. Prefer depth on one matched JD problem over shallow coverage of many.

First generate five to ten plausible situations internally; rank by **JD match strength**, then expand the winner.

## Required story contents

Product, user, exact use case, business reason, starting problem, personally owned actions, result, business impact, exact era-pinned technologies (named + relevant **adjacent** stack from the landscape), **`toolDecisions[]`** (why chosen vs. alternatives), **point architecture** (components + request flow + **Mermaid diagram**), **`businessTerms[]`**, **`challenges[]`**, collaboration, failure handling, evidence, `measurements[]` when any number is claimed, `interviewerQA[]`, and `jdAlignment`.

## Abbreviations (first mention)

On first use of a short form in this point’s prose (`architecture.summary`, `fullStory`, `requestFlow`, `businessTerms`, `challenges`, `interviewerQA`), write the **full phrase then the short form in parentheses**.

Examples: `Single-Page Application (SPA)`, `Application Programming Interface (API)`, `Human-in-the-Loop (HITL)`, `OpenTelemetry (OTel)`.

After the first expansion in that point, the short form alone is fine. Do not leave bare acronyms unexplained on first mention.

## Measurements (numbers)

If the résumé or story claims a number, percent, time, cost, volume, or latency improvement, fill `measurements[]` per `prompts/measurements.md`:

- `before` — what the number/state was
- `after` — what it became
- `calculation` — formula or method behind the improvement
- `scope` — what was measured
- `evidence` — where to prove it

Do not invent undefended precision. Qualitative before/after with a clear check method is allowed when no honest number exists.

## Architecture & Mermaid diagram (this point only)

Fill `architecture` so an interviewer can follow **this** system visually and verbally:

- `components` with `layer` + `role` (`client` / `edge` / `backend` / `data` / `ai` / `integration` / `infra` / `other`)
- `requestFlow`: ordered path such as UI → API → datastore → AI/service → response
- `mermaid`: a clean, valid Mermaid diagram (`flowchart LR`, `flowchart TD`, or `sequenceDiagram`) depicting the exact setup and request flow. Quote every node label containing spaces, punctuation, parentheses, or brackets (e.g. `A["Client App (SPA)"]`), avoid raw HTML tags, and verify syntax carefully so the dashboard renders it cleanly.
- `aiPlacement`: product AI in the path vs coding-assistant use while building (keep distinct)
- Include adjacent pieces that make the path real (auth, cache, queue, observability) when the landscape supports them

## Exact versions & Tool Decisions ("Why this tool vs. alternatives?")

- Every entry in `technologies[]` must pin a concrete, era-accurate `version` (e.g., exact Node.js LTS, Angular/React major, Python minor, database version) and `eraFit` consistent with `timelineChecks` and the employment window — avoid vague placeholders like `"current"` or `"latest"`.
- Fill `toolDecisions[]` with researched comparisons for the key technologies in this point:
  - Set `selectionType` honestly: `"existing-stack-continuity"` (when the team/company already ran that tool in production and continuing avoided migration tax), `"technical-tradeoff"` (greenfield or deliberate switch), or `"hybrid"` (both continuity and technical fit).
  - List concrete `alternativesConsidered` with sharp `whyNot` explanations grounded in real tradeoffs.

## Business terms, challenges & follow-up Q&A

- Fill `businessTerms[]` (`term`, `definition`, `howWeSolvedIt`) for relevant domain/business concepts in the story.
- Fill `challenges[]` (`challenge`, `rootCause`, `howWeSolvedIt`, `outcome`) with concrete engineering, data, scale, or product hurdles faced and how they were resolved.
- Fill `interviewerQA[]` (`question`, `answer`) with 3–5 likely interviewer follow-ups and concise, spoken-ready answers (rendered as expandable Q&A cards in the dashboard).

## Collaboration and AI tooling

Include Product/UX/partner interactions. For 2024+ windows, lightly mention coding assistants via `aiTooling`; never force them into pre-2024 windows.

## Anti-repeat

If `priorPoints` exist, differentiate product angle, workflow, failure path, collaboration, architecture emphasis, and which JD hooks you cover.
