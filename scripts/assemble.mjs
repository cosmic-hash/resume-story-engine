import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runSlug = process.argv[2];

if (!runSlug) {
  console.error("Usage: node scripts/assemble.mjs <run-slug>");
  process.exit(1);
}

const runDir = path.join(root, "data", "private", runSlug);
if (!fs.existsSync(runDir)) {
  console.error(`Run directory not found: ${runDir}`);
  process.exit(1);
}

const readJson = (file, required = true) => {
  const full = path.join(runDir, file);
  if (!fs.existsSync(full)) {
    if (required) {
      console.error(`Missing required stage file: ${full}`);
      process.exit(1);
    }
    return null;
  }
  return JSON.parse(fs.readFileSync(full, "utf8"));
};

const roleSummary = readJson("01-role-summary.json");
const techLandscape = readJson("01b-tech-landscape.json", false);
const pointIndex = readJson("02-point-index.json");
const answers = readJson("04-answers.json");
const review = readJson("05-review.json", false) || { status: "needs-review", checks: [] };

const existingPrep = readJson("06-preparation.json", false);
const bumpPatch = (v = "0.3.0") => {
  const parts = String(v).split(".").map((n) => Number(n) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join(".");
};

const points = (pointIndex.points || []).map((card) => {
  const pt = readJson(path.join("03-points", `${card.id}.json`));
  if (!pt.status || pt.status === "draft") pt.status = "needs-review";
  return pt;
});

const prep = {
  version: existingPrep ? bumpPatch(existingPrep.version) : "0.3.0",
  roleSummary,
  ...(techLandscape ? { techLandscape } : {}),
  points,
  generalAnswers: answers.generalAnswers || [],
  evaluation: {
    status: review.status || "needs-review",
    checks: review.checks || []
  }
};

const prepPath = path.join(runDir, "06-preparation.json");
fs.writeFileSync(prepPath, JSON.stringify(prep, null, 2) + "\n");

const progress = {
  runSlug,
  stage: "done",
  lastCompletedPointId: points[points.length - 1]?.id || null,
  nextPointId: null,
  pointOrder: points.map((p) => p.id),
  updatedAt: new Date().toISOString()
};
fs.writeFileSync(path.join(runDir, "_progress.json"), JSON.stringify(progress, null, 2) + "\n");

// Generate 07-study-guide.md cleanly from assembled preparation
const escDollar = (s = "") => String(s).replace(/\$/g, "\\$");
const lines = [];
lines.push(`# ${roleSummary.company} — ${roleSummary.role} (Interview Study Guide)`);
lines.push("");
lines.push("> [!NOTE]");
lines.push(`> Auto-generated from \`data/private/${runSlug}/06-preparation.json\` (v${prep.version}) — ${points.length} expanded stories + ${prep.generalAnswers.length} general/STAR answers.`);
lines.push("");

for (const [idx, pt] of points.entries()) {
  lines.push("---");
  lines.push(`### ${idx + 1}. ${pt.experienceWindow?.source || pt.id} — \`${pt.id}\`${pt.experienceWindow?.start ? ` (${pt.experienceWindow.start} to ${pt.experienceWindow.end || ""})` : ""}`);
  lines.push("");
  lines.push(`**Résumé Bullet:** ${escDollar(pt.originalPoint)}`);
  lines.push("");
  lines.push(`- **Product & User:** ${escDollar(pt.product)} Serving: ${escDollar(pt.user)}`);
  lines.push(`- **Starting Problem:** ${escDollar(pt.startingProblem)}`);
  lines.push(`- **Result & Business Impact:** ${escDollar(pt.result)} — ${escDollar(pt.businessImpact)}`);
  lines.push("");
  if (pt.architecture?.mermaid) {
    lines.push("#### Setup & Request Flow (Mermaid)");
    lines.push("");
    lines.push("```mermaid");
    lines.push(pt.architecture.mermaid);
    lines.push("```");
    lines.push("");
  }
  if (pt.technologies?.length) {
    lines.push("#### Exact Versions Used");
    lines.push("");
    lines.push("| Technology | Exact Version | Responsibility |");
    lines.push("|---|---|---|");
    for (const t of pt.technologies) {
      lines.push(`| **${t.name}** | \`${t.version}\` | ${escDollar(t.responsibility)} |`);
    }
    lines.push("");
  }
  if (pt.toolDecisions?.length) {
    lines.push("#### Tool Decisions: Why This Tool & Why Not Alternatives?");
    lines.push("");
    for (const td of pt.toolDecisions) {
      const tag = td.selectionType === "existing-stack-continuity"
        ? "Existing Stack Continuity"
        : td.selectionType === "hybrid"
          ? "Continuity + Technical Fit"
          : "Technical Tradeoff";
      lines.push(`- **${td.tool}** _(${tag})_: ${escDollar(td.whyChosen)}`);
      for (const alt of td.alternativesConsidered || []) {
        lines.push(`  - *Why not ${alt.name}?* ${escDollar(alt.whyNot)}`);
      }
    }
    lines.push("");
  }
  if (pt.businessTerms?.length) {
    lines.push("#### Business & Domain Terms (And How We Solved Them)");
    lines.push("");
    for (const bt of pt.businessTerms) {
      lines.push(`- **${bt.term}:** ${escDollar(bt.definition)} **How we solved it:** ${escDollar(bt.howWeSolvedIt)}`);
    }
    lines.push("");
  }
  if (pt.challenges?.length) {
    lines.push("#### Challenges Faced & How We Solved Them");
    lines.push("");
    for (const ch of pt.challenges) {
      lines.push(`- **Challenge:** ${escDollar(ch.challenge)}`);
      lines.push(`  - *Root cause:* ${escDollar(ch.rootCause)}`);
      lines.push(`  - *Solution:* ${escDollar(ch.howWeSolvedIt)}`);
      lines.push(`  - *Outcome:* ${escDollar(ch.outcome)}`);
    }
    lines.push("");
  }
  if (pt.measurements?.length) {
    lines.push("#### Numbers & Measurement Defense");
    lines.push("");
    for (const m of pt.measurements) {
      lines.push(`- **${escDollar(m.metric)}:** Before: ${escDollar(m.before)} → After: ${escDollar(m.after)}. *Calculation:* ${escDollar(m.calculation)} *Evidence:* ${escDollar(m.evidence)}`);
    }
    lines.push("");
  }
  lines.push(`**Spoken Story:** ${escDollar(pt.fullStory)}`);
  lines.push("");
  if (pt.interviewerQA?.length) {
    lines.push("#### Likely Follow-Up Questions & Model Answers");
    lines.push("");
    for (const qa of pt.interviewerQA) {
      lines.push(`- **Q: ${escDollar(qa.question)}**`);
      lines.push(`  - *A:* ${escDollar(qa.answer)}`);
    }
    lines.push("");
  } else if (pt.interviewerQuestions?.length) {
    lines.push(`**Likely Follow-Up Questions:** ${pt.interviewerQuestions.map(escDollar).join(" · ")}`);
    lines.push("");
  }
}

lines.push("---");
lines.push("## General & Behavioral (CTAR) Spoken Answers");
lines.push("");
for (const ans of prep.generalAnswers) {
  lines.push(`### ${ans.question} (\`${ans.id}\`${ans.targetSeconds ? ` · ~${ans.targetSeconds}s` : ""})`);
  lines.push("");
  lines.push(escDollar(ans.answer));
  lines.push("");
  if (ans.ctar) {
    lines.push(`- **Context:** ${escDollar(ans.ctar.context || "")}`);
    lines.push(`- **Task:** ${escDollar(ans.ctar.task || "")}`);
    lines.push(`- **Action:** ${escDollar(ans.ctar.action || "")}`);
    lines.push(`- **Result:** ${escDollar(ans.ctar.result || "")}`);
    lines.push("");
  }
}

const guidePath = path.join(runDir, "07-study-guide.md");
fs.writeFileSync(guidePath, lines.join("\n"));
console.log(`✓ Assembled ${path.relative(root, prepPath)} (v${prep.version}) and ${path.relative(root, guidePath)}.`);

execFileSync(process.execPath, [path.join(root, "scripts", "validate.mjs"), prepPath], { stdio: "inherit" });
