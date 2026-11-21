# Expand one résumé point

Read one résumé point, the compact role summary, the tech landscape brief (`01b-tech-landscape.json`), company context, and any `priorPoints` already expanded for this same target role. Return only JSON matching `spec/resume-point.schema.json`.

First generate five to ten plausible situations internally. Select the one that best matches the role’s product, users, workflows, and evaluation signals. The returned story must name the product, user, exact use case, business reason, starting problem, personally owned actions, result, business impact, technology responsibilities (with plausible `version` and `eraFit`), collaboration with Product/UX/other partners, failure handling, role connection, and evidence.

Ground technical choices in the landscape brief: use purpose, gaps, and architecture hooks so the story sounds like real practice (for example agent architectures when the point involves agents). Do not contradict `timelineChecks`; if a tool is anachronistic for the résumé window, choose a plausible alternative or mark `eraFit` as `stretch`/`anachronistic` with an `eraNote`.

Include `collaboration.partners` and concrete `interactions` (spec reviews, design critiques, demos, incident threads, customer feedback loops). When the experience window is 2024 or later, lightly weave AI coding-assistant use via `aiTooling` and a natural hint in `actions` or `fullStory` (drafting tests, exploring APIs, reviewing diffs) and how that work was shared with the team. Do not force AI tooling into pre-2024 windows.

If `priorPoints` is present, do not reuse the same product narrative, primary metric story, or action framing. Differentiate user, workflow, failure path, collaboration angle, and role connection.

If a number appears, include its before value, after value, formula, comparison scope, and evidence source. If the point has no defensible number, use task-completion or workflow evidence instead of inventing a percentage. Keep the selected story internally consistent and do not expose rejected possibilities unless the application explicitly requests them.
