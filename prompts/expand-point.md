# Expand one résumé point

Read one résumé point, the compact role summary, the relevant company context, and any `priorPoints` already expanded for this same target role. Return only JSON matching `spec/resume-point.schema.json`.

First generate five to ten plausible situations internally. Select the one that best matches the role’s product, users, workflows, and evaluation signals. The returned story must name the product, user, exact use case, business reason, starting problem, personally owned actions, result, business impact, technology responsibilities, failure handling, role connection, and evidence.

If `priorPoints` is present, do not reuse the same product narrative, primary metric story, or action framing. Differentiate user, workflow, failure path, and role connection so the interview set for this company does not sound repetitive.

If a number appears, include its before value, after value, formula, comparison scope, and evidence source. If the point has no defensible number, use task-completion or workflow evidence instead of inventing a percentage. Keep the selected story internally consistent and do not expose rejected possibilities unless the application explicitly requests them.
