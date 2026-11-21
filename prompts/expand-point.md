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

Product, user, exact use case, business reason, starting problem, personally owned actions, result, business impact, technologies (named + relevant **adjacent** stack from the landscape), **point architecture** (components + request flow), collaboration, failure handling, evidence, and `jdAlignment`.

## Architecture (this point only)

Fill `architecture` so an interviewer can follow **this** system:

- `components` with `layer` + `role` (client / backend / data / ai / integration / infra / …)
- `requestFlow`: ordered path such as UI → API → datastore → AI/service → response
- `aiPlacement`: product AI in the path vs coding-assistant use while building (keep distinct)
- Include adjacent pieces that make the path real (auth, cache, queue, observability) when the landscape supports them

## Technologies

- Include primary tools from the résumé/JD **and** small surrounding tools from `adjacentTechnologies` when they honestly appear in the request flow or build/ship path.
- Every entry needs `version` + `eraFit` consistent with `timelineChecks` / the experience window.

## Collaboration and AI tooling

Include Product/UX/partner interactions. For 2024+ windows, lightly mention coding assistants via `aiTooling`; never force them into pre-2024 windows.

## Anti-repeat

If `priorPoints` exist, differentiate product angle, workflow, failure path, collaboration, architecture emphasis, and which JD hooks you cover.
