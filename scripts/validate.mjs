import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const prepPath = path.join(root, "data", "instrumental-demo.json");
const prep = JSON.parse(fs.readFileSync(prepPath, "utf8"));
const errors = [];
const required = (value, keys, label) => keys.forEach((key) => {
  if (value?.[key] === undefined || value?.[key] === null || value?.[key] === "") errors.push(`${label}.${key} is required`);
});

required(prep, ["version", "roleSummary", "points", "generalAnswers", "evaluation"], "preparation");
required(prep.roleSummary, ["company", "role", "requiredTechnologies", "userWorkflows", "evaluationSignals", "interviewThemes"], "roleSummary");
if (!Array.isArray(prep.points) || prep.points.length === 0) errors.push("preparation.points must contain at least one point");
const ids = new Set();
for (const [index, point] of (prep.points || []).entries()) {
  const label = `points[${index}]`;
  required(point, ["id", "originalPoint", "product", "user", "useCase", "businessReason", "startingProblem", "actions", "result", "businessImpact", "technologies", "collaboration", "evidence", "roleConnection", "fullStory"], label);
  if (ids.has(point.id)) errors.push(`${label}.id is duplicated: ${point.id}`);
  ids.add(point.id);
  if (!Array.isArray(point.actions) || point.actions.length < 2) errors.push(`${label}.actions must contain at least two actions`);
  if (!Array.isArray(point.technologies) || point.technologies.length === 0) errors.push(`${label}.technologies must not be empty`);
  for (const [techIndex, tech] of (point.technologies || []).entries()) {
    required(tech, ["name", "responsibility", "version", "eraFit"], `${label}.technologies[${techIndex}]`);
    if (tech.eraFit && !["plausible", "stretch", "anachronistic"].includes(tech.eraFit)) {
      errors.push(`${label}.technologies[${techIndex}].eraFit must be plausible, stretch, or anachronistic`);
    }
  }
  required(point.collaboration, ["partners", "interactions"], `${label}.collaboration`);
  if (!Array.isArray(point.collaboration?.partners) || point.collaboration.partners.length === 0) {
    errors.push(`${label}.collaboration.partners must not be empty`);
  }
  if (!Array.isArray(point.collaboration?.interactions) || point.collaboration.interactions.length === 0) {
    errors.push(`${label}.collaboration.interactions must not be empty`);
  }
  for (const [measurementIndex, measurement] of (point.measurements || []).entries()) required(measurement, ["metric", "before", "after", "calculation", "scope", "evidence"], `${label}.measurements[${measurementIndex}]`);
}
for (const [index, answer] of (prep.generalAnswers || []).entries()) required(answer, ["id", "question", "answer", "anchorPointIds"], `generalAnswers[${index}]`);
required(prep.evaluation, ["status", "checks"], "evaluation");
if (errors.length) { console.error(errors.map((error) => `✗ ${error}`).join("\n")); process.exit(1); }
console.log(`✓ Validated ${prep.points.length} résumé point(s), ${prep.generalAnswers.length} general answer(s), and ${prep.evaluation.checks.length} evaluation check(s).`);
