# Agent instructions

## Resume Story runs

When generating interview preparation from a résumé and job description in this repo:

1. Prefer the project skill `resume-story` (invoke `/resume-story` or follow `.cursor/skills/resume-story/SKILL.md`).
2. Write checkpoint files under `data/private/<run-slug>/` — do not produce only a chat-wall final answer.
3. After role extraction, research `01b-tech-landscape.json` with live sources before expanding points (versions, gaps, architectures, Product/UX norms, post-2024 AI coding tools, timeline checks).
4. Run stages automatically without waiting for the user to say "next".
5. Expand résumé points **one after another**. Each new point must read prior `03-points/*.json` and the landscape brief, and avoid repeating the same story angle for the same target company.
6. Keep personal résumé/JD and private runs out of git (`data/private/` is ignored).

Do not invent API keys or call external model providers unless the user asks for a separate adapter. Cursor chat is the default runner.
