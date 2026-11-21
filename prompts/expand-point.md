# Expand one résumé point

Read one résumé point, the compact role summary, and the relevant company context. Return only JSON matching `spec/resume-point.schema.json`.

First generate five to ten plausible situations internally. Select the one that best matches the role’s product, users, workflows, and evaluation signals. The returned story must name the product, user, exact use case, business reason, starting problem, personally owned actions, result, business impact, technology responsibilities, failure handling, role connection, and evidence.

If a number appears, include its before value, after value, formula, comparison scope, and evidence source. If the point has no defensible number, use task-completion or workflow evidence instead of inventing a percentage. Keep the selected story internally consistent and do not expose rejected possibilities unless the application explicitly requests them.
