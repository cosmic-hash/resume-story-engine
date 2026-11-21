# Review one answer

Evaluate the answer (and linked points) against the role summary and tech landscape brief. Return JSON with `status`, `passes`, `gaps`, and `repairFields`.

For **résumé points**, check deep JD match (`jdAlignment` hooks are specific, not generic), architecture clarity on the point (components + request flow — never required on general answers), adjacent supporting tech when the path needs it, product/user/workflow specificity, ownership, version/era realism, collaboration, impact, measurement math, evidence, failure handling, and role alignment.

For **general answers**, check bank coverage (~60s intro, distinct modern generals), natural delivery, and unsupported claims — not architecture diagrams.

When the experience window is 2024+, check AI-assisted workflow is mentioned naturally or honestly omitted.

A review may fail only the missing fields; it must not rewrite a strong answer unnecessarily.
