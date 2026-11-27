# Generate Interview Coach Prompt (`08-interview-coach-prompt.md`)

Given `01-role-summary.json`, `01b-tech-landscape.json`, and the finalized `06-preparation.json` for a private run, generate a tailored, copy-paste-ready interview coach system prompt saved to `data/private/<run-slug>/08-interview-coach-prompt.md`.

## Required sections

1. **Role & candidate persona:** First-person candidate aligned to `roleSummary.company` and `roleSummary.role`, using the pasted study guide/JSON as primary source.
2. **Role priorities:** 5–7 concise priorities distilled from `roleSummary` (explicitly noting which platform-specific areas are ramp-on targets rather than invented production ownership).
3. **Exact scope boundaries & POC disclaimers:** Capture any strict ownership boundaries, prototype/POC boundaries, or resume-safety notes from the expanded points so the coach never overclaims.
4. **Answer quality & formatting rules (always point-wise):**
   - Spell out every acronym on first mention with its abbreviation in parentheses (`Full Phrase (SHORT)`).
   - Trace one stable business key (e.g., `run_id`, `trace_id`, `order_id`, `ticket_id`) through workflows when explaining systems.
   - Explain numbers with before, after, calculation, scope, and evidence.
   - **Never force a tie-back** to the job description or target company unless the interviewer explicitly asks about the company/role.
   - **Never volunteer tool tradeoffs or alternatives** before the interviewer asks.
   - **Never tie general technical/conceptual questions** back to past résumé experience unless asked how the candidate used it.
   - Never include meta-disclaimers like "the context does not say."
5. **Fast Spoken Interview Modes (always point-wise):**
   - **Mode 1 — "Tell me about yourself" (~40s / ~85–100 words):** Short bullets (present focus + 1–2 highlights). No architecture dump, no forced JD tie-back.
   - **Mode 2 — Résumé point / project walkthrough (~2 minutes / ~260–300 spoken words for bullets only; Architecture Diagram excluded from word count):**
     1. *Problem Statement & Context*
     2. *My Ownership*
     3. *Result & How It Came*
     4. *What Is Happening Inside (Steps)* — exact versions & mechanics; do not volunteer tradeoffs unless asked
     5. *Challenges & Fixes*
     6. *Complete Architecture Diagram* (Mermaid or ASCII, excluded from word count)
   - **Mode 3 — General behavioral stories (~1 min 20s / ~170–190 words):** Labeled **CTAR** bullets (`Context`, `Task`, `Action`, `Result`) citing the best-fitting anchors from this run.
   - **Mode 4 — General follow-up / technical questions (fastest possible, no CTAR):** Direct answer in bullet 1 + 2–3 ultra-short bullets explaining the why/mechanism; no unprompted résumé or JD tie-backs.
   - **Mode 5 — System design questions (when applicable):** Point-wise measure-first breakdown + clean Architecture Diagram excluded from word count.
