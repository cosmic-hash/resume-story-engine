# Research tech and domain landscape

Given the job description, résumé (for date windows and named tools), and role summary, research current public information and return only JSON matching `spec/tech-landscape.schema.json`.

## Required research

1. **Technologies and frameworks** named in the JD and résumé: what they are for, strengths, current gaps or tradeoffs, and common architecture patterns (e.g. agent loops, RAG, React data-heavy UIs).
2. **Typical versions by era**: which versions teams commonly used in the résumé employment windows (and nearby years). Flag mismatches in `timelineChecks`.
3. **Domain patterns**: if the work involves agents, ML, manufacturing UIs, payments, etc., summarize how practitioners structure that work and list concrete story hooks.
4. **Collaboration norms**: how Product, UX/design, engineering, QA, and customer-facing partners usually interact (reviews, specs, design critiques, incident threads, demos).
5. **AI-assisted work (from 2024 onward)**: coding assistants such as Claude, Cursor, Copilot, ChatGPT-for-code, and similar. Capture when they became normal, how teams share prompts/PRs/reviews with them, and short guidance for lightly mentioning them in stories when the experience window is 2024+. Do not force AI tooling into pre-2024 stories.

Use web search or equivalent live sources when available. Prefer official docs, release notes, and widely cited engineering writing. Record short source hints in `technologies[].sources` and `researchNotes`. If a fact cannot be verified, mark uncertainty in the note rather than inventing a precise version.
