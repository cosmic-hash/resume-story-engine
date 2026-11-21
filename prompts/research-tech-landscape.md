# Research tech and domain landscape

Given the job description, résumé (for date windows and named tools), and role summary, research current public information and return only JSON matching `spec/tech-landscape.schema.json`.

## Required research

1. **Named technologies and frameworks** from the JD and résumé: purpose, strengths, current gaps/tradeoffs, and common architecture patterns.
2. **Adjacent / supporting technologies** (required): tools often missing from the JD but needed to make that stack work in practice — e.g. around React you may research routing, bundlers, CI, monitoring, auth, API clients, caching, feature flags, design systems, testing libs; around agents you may research orchestration, tracing, eval harnesses, vector stores, queueing, secrets, rate limits. Put these in `adjacentTechnologies` with `supports`, `whyNeeded`, and `whereItShowsUp`. Prefer realistic companions for this role/domain, not a random laundry list.
3. **Typical versions by era** for named and important adjacent tools. Flag résumé-window mismatches in `timelineChecks`.
4. **Domain patterns** tied to the JD’s product problems (agents, manufacturing UIs, payments, etc.) with concrete story hooks.
5. **Collaboration norms**: Product, UX, engineering, QA, customer-facing partners.
6. **AI-assisted work (from 2024 onward)**: Claude, Cursor, Copilot, and similar — norms and mention guidance. Do not force into pre-2024 stories.

Use web search or equivalent live sources when available. Record short source hints. If a fact cannot be verified, mark uncertainty rather than inventing a precise version.
