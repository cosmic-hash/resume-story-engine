# Measurement breakdown (numbers and claims)

Use this whenever a résumé point, story, or answer includes a **number**, percent, time saved, cost, volume, latency, completion rate, or similar measurable claim. Return or repair `measurements[]` objects matching `spec/resume-point.schema.json`.

## When required

- Any numeric claim in `result`, `businessImpact`, `fullStory`, `evidence`, or general answers that cite a figure from this point.
- Prefer one clear measurement per claim; multiple entries if the story has distinct metrics.

If the résumé has **no number** and inventing one would be dishonest, either omit a fake figure or use a qualitative measurement that still fills every field (what was broken → what improved → how you would check it). Never invent a precise percent without evidence the candidate can defend.

## Required fields (every measurement)

| Field | Meaning |
|---|---|
| `metric` | Name of what was measured (e.g. “API response time”, “searchable content coverage”). |
| `before` | The **starting number or state** — what it was before the change. Include units. |
| `after` | The **improved number or state** — what it became. Same unit convention as `before`. |
| `calculation` | The **formula or method** that turns before/after into the claimed improvement. Prefer an explicit equation when a percent or ratio is claimed. |
| `scope` | What was included/excluded (dataset, endpoint, time window, concurrency, environment). |
| `evidence` | Where the candidate would look to prove it (dashboard, benchmark log, PR, ticket, recording). |

## Calculation examples (style)

- Latency drop: `(baseline_ms − after_ms) ÷ baseline_ms × 100 = N%`.
- Coverage increase: `(after_count − before_count) ÷ before_count × 100 = N%`.
- Speed-up claim: state whether you mean throughput or latency and do not mix conventions in one sentence.
- Qualitative only: describe the comparison method (“same seeded cohort, count wrong turns and re-filter events”) instead of inventing a percent.

## Honesty rules

1. Same workload and definition for before and after.
2. Do not present an unbounded all-time number as a release comparison.
3. If the résumé states a number without method, reconstruct a plausible method and mark the point `needs-review` so the candidate confirms.
4. Reviewers check: every numeric claim has before, after, calculation, scope, and evidence (`evals/quality-cases.json` → `measurement`).
