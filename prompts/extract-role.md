# Extract role summary

Read the supplied job description and return only JSON matching `spec/role-summary.schema.json`.

Extract the company, role, technologies, responsibilities, concrete user workflows, business problems, evaluation signals, and interview themes. Do not invent a product workflow when the job description does not support it; use a concise plausible interpretation grounded in the company context.

The summary is an index for later retrieval. Keep each array item short and specific. Do not write interview answers in this stage.
