# Generate general interview answers

Read the role summary, tech landscape, expanded points, and `evals/general-questions.json`. Return JSON for `04-answers.json` with a `generalAnswers` array covering **every** `required` item in that bank.

General answers are **spoken rehearsal answers only**. Do **not** invent architecture blocks here — system architecture lives on each expanded résumé point.

## Rules

1. **Tell me about yourself (`intro`)**: about **60 seconds** spoken. Standard shape only — present focus, one or two résumé anchors, why this role. Do not dump the whole résumé or describe full system architecture in the intro.
2. **Very general items** (`mustBeDistinct: true`): each needs a unique spoken angle (intro, why-company, AI workflow, asking for help / admitting mistakes). They may share `anchorPointIds` but must not sound like the same paragraph rewritten.
3. **STAR / behavioral items** (`format: ctar`): include a `ctar` object `{ context, task, action, result }`. Reusing the same expanded point across STAR questions is allowed when it fits; prefer different points when two strong ones exist.
4. Use only expanded point IDs as anchors. Name user, workflow, ownership, mechanism, result, and impact where the question needs a story.
5. For `ai-workflow`, describe real coding-assistant / AI product use for 2024+ windows; if the résumé is earlier, say so briefly and honestly.
6. Keep answers conversational and rehearsal-ready. Target the `targetSeconds` as a length guide (~130–150 spoken words per 60 seconds).
