# Extract role summary

Read the supplied job description and return only JSON matching `spec/role-summary.schema.json`.

Extract the company, role, technologies, responsibilities, concrete user workflows, business problems, evaluation signals, and interview themes. Keep each array item **specific and quotable** so later point expansion can map résumé bullets tightly to the JD (prefer “Investigate anomalies on a serialized unit with image + measurement evidence” over “work on the product”).

Do not invent a product workflow when the job description does not support it; use a concise plausible interpretation grounded in the company context.

The summary is an index for later retrieval and **JD-matching**. Do not write interview answers or system architecture in this stage.
