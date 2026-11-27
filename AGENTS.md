# Agent instructions

## Resume Story runs

When generating or updating interview preparation from a résumé and job description in this repo:

1. Prefer the project skill `resume-story` (invoke `/resume-story` or follow `.agents/skills/resume-story/SKILL.md`).
2. Write all checkpoint files, assembled JSON, study guide, coach prompt, and any round-specific guides inside the **same `data/private/<run-slug>/` folder** — do not produce only a chat-wall final answer.
3. After role extraction, research `01b-tech-landscape.json` with live sources before expanding points (exact release versions by era, tool tradeoffs/alternatives, architectures, Product/UX norms, post-2024 AI coding tools, timeline checks).
4. Run stages automatically without waiting for the user to say "next".
5. Expand résumé points **one after another**. Each new point must read prior `03-points/*.json` and the landscape brief, avoid repeating the same story angle, and include exact versions, a valid Mermaid diagram (`architecture.mermaid`), `toolDecisions`, `businessTerms`, `challenges`, `measurements`, and `interviewerQA` with first-mention acronyms expanded (`Full Phrase (SHORT)`).
6. Assemble and validate via `node scripts/assemble.mjs <run-slug>` (which builds `06-preparation.json` + `07-study-guide.md` and validates automatically). When the user adds new project context later, update the affected files in the same `data/private/<run-slug>/` folder and re-run `node scripts/assemble.mjs <run-slug>` so the shared dashboard (`npm run dashboard`) updates live.
7. Keep all personal résumés, JDs, company-specific details, and private runs strictly out of git (`data/private/` is ignored).

Do not invent API keys or call external model providers unless the user asks for a separate adapter. Agent chat is the default runner.
