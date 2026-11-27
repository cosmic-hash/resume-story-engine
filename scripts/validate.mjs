import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targetArg = process.argv[2];
const prepPath = targetArg
  ? path.resolve(process.cwd(), targetArg)
  : path.join(root, "data", "instrumental-demo.json");

const prep = JSON.parse(fs.readFileSync(prepPath, "utf8"));
const questionBank = JSON.parse(fs.readFileSync(path.join(root, "evals", "general-questions.json"), "utf8"));
const errors = [];
const required = (value, keys, label) =>
  keys.forEach((key) => {
    if (value?.[key] === undefined || value?.[key] === null || value?.[key] === "") {
      errors.push(`${label}.${key} is required`);
    }
  });

required(prep, ["version", "roleSummary", "points", "generalAnswers", "evaluation"], "preparation");
required(
  prep.roleSummary,
  ["company", "role", "requiredTechnologies", "userWorkflows", "evaluationSignals", "interviewThemes"],
  "roleSummary"
);
if (!Array.isArray(prep.points) || prep.points.length === 0) {
  errors.push("preparation.points must contain at least one point");
}

const ids = new Set();
const architectureLayers = new Set(["client", "edge", "backend", "data", "ai", "integration", "infra", "other"]);
const jdAreas = new Set(["responsibility", "userWorkflow", "businessProblem", "evaluationSignal", "technology", "interviewTheme"]);
const selectionTypes = new Set(["technical-tradeoff", "existing-stack-continuity", "hybrid"]);

for (const [index, point] of (prep.points || []).entries()) {
  const label = `points[${index}](${point?.id || "unknown"})`;
  required(
    point,
    [
      "id", "originalPoint", "product", "user", "useCase", "businessReason",
      "startingProblem", "actions", "result", "businessImpact", "technologies",
      "architecture", "jdAlignment", "collaboration", "evidence", "roleConnection", "fullStory"
    ],
    label
  );
  if (ids.has(point.id)) errors.push(`${label}.id is duplicated: ${point.id}`);
  ids.add(point.id);
  if (!Array.isArray(point.actions) || point.actions.length < 2) {
    errors.push(`${label}.actions must contain at least two actions`);
  }
  if (!Array.isArray(point.technologies) || point.technologies.length === 0) {
    errors.push(`${label}.technologies must not be empty`);
  }
  for (const [techIndex, tech] of (point.technologies || []).entries()) {
    required(tech, ["name", "responsibility", "version", "eraFit"], `${label}.technologies[${techIndex}]`);
    if (tech.eraFit && !["plausible", "stretch", "anachronistic"].includes(tech.eraFit)) {
      errors.push(`${label}.technologies[${techIndex}].eraFit must be plausible, stretch, or anachronistic`);
    }
  }
  required(point.architecture, ["summary", "components", "requestFlow", "mermaid"], `${label}.architecture`);
  if (!Array.isArray(point.architecture?.components) || point.architecture.components.length < 2) {
    errors.push(`${label}.architecture.components must contain at least two components`);
  }
  for (const [compIndex, component] of (point.architecture?.components || []).entries()) {
    required(component, ["name", "layer", "role"], `${label}.architecture.components[${compIndex}]`);
    if (component.layer && !architectureLayers.has(component.layer)) {
      errors.push(`${label}.architecture.components[${compIndex}].layer is invalid`);
    }
  }
  if (!Array.isArray(point.architecture?.requestFlow) || point.architecture.requestFlow.length < 2) {
    errors.push(`${label}.architecture.requestFlow must contain at least two steps`);
  }
  required(point.jdAlignment, ["matchSummary", "hooks"], `${label}.jdAlignment`);
  if (!Array.isArray(point.jdAlignment?.hooks) || point.jdAlignment.hooks.length < 2) {
    errors.push(`${label}.jdAlignment.hooks must contain at least two JD hooks`);
  }
  for (const [hookIndex, hook] of (point.jdAlignment?.hooks || []).entries()) {
    required(hook, ["jdArea", "jdText", "howThisPointMatches"], `${label}.jdAlignment.hooks[${hookIndex}]`);
    if (hook.jdArea && !jdAreas.has(hook.jdArea)) {
      errors.push(`${label}.jdAlignment.hooks[${hookIndex}].jdArea is invalid`);
    }
  }
  required(point.collaboration, ["partners", "interactions"], `${label}.collaboration`);
  if (!Array.isArray(point.collaboration?.partners) || point.collaboration.partners.length === 0) {
    errors.push(`${label}.collaboration.partners must not be empty`);
  }
  if (!Array.isArray(point.collaboration?.interactions) || point.collaboration.interactions.length === 0) {
    errors.push(`${label}.collaboration.interactions must not be empty`);
  }
  for (const [mIdx, m] of (point.measurements || []).entries()) {
    required(m, ["metric", "before", "after", "calculation", "scope", "evidence"], `${label}.measurements[${mIdx}]`);
  }
  for (const [dIdx, td] of (point.toolDecisions || []).entries()) {
    required(td, ["tool", "whyChosen", "alternativesConsidered"], `${label}.toolDecisions[${dIdx}]`);
    if (td.selectionType && !selectionTypes.has(td.selectionType)) {
      errors.push(`${label}.toolDecisions[${dIdx}].selectionType is invalid`);
    }
    for (const [aIdx, alt] of (td.alternativesConsidered || []).entries()) {
      required(alt, ["name", "whyNot"], `${label}.toolDecisions[${dIdx}].alternativesConsidered[${aIdx}]`);
    }
  }
  for (const [bIdx, bt] of (point.businessTerms || []).entries()) {
    required(bt, ["term", "definition", "howWeSolvedIt"], `${label}.businessTerms[${bIdx}]`);
  }
  for (const [cIdx, ch] of (point.challenges || []).entries()) {
    required(ch, ["challenge", "rootCause", "howWeSolvedIt", "outcome"], `${label}.challenges[${cIdx}]`);
  }
  for (const [qIdx, qa] of (point.interviewerQA || []).entries()) {
    required(qa, ["question", "answer"], `${label}.interviewerQA[${qIdx}]`);
  }
}

const answerIds = new Set();
for (const [index, answer] of (prep.generalAnswers || []).entries()) {
  required(answer, ["id", "question", "answer", "anchorPointIds"], `generalAnswers[${index}]`);
  answerIds.add(answer.id);
}
for (const item of questionBank.required || []) {
  if (!answerIds.has(item.id)) errors.push(`generalAnswers missing required bank id: ${item.id}`);
}
required(prep.evaluation, ["status", "checks"], "evaluation");

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join("\n"));
  process.exit(1);
}
console.log(
  `✓ Validated ${path.relative(root, prepPath)}: ${prep.points.length} résumé point(s), ${prep.generalAnswers.length} general answer(s), and ${prep.evaluation.checks.length} evaluation check(s).`
);
