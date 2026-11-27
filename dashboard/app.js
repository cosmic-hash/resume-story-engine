const app = document.querySelector("#app");
const status = document.querySelector("#status");
const runSelect = document.querySelector("#run-select");
const dlMdBtn = document.querySelector("#dl-md");
const dlHtmlBtn = document.querySelector("#dl-html");
const dlJsonBtn = document.querySelector("#dl-json");

let currentPrep = null;
let currentRunId = "preparation";
let currentRunDocs = [];

const esc = (value = "") =>
  String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
const list = (items = []) => items.map((item) => `<li>${esc(item)}</li>`).join("");

let mermaidLib = null;
const loadMermaid = async () => {
  if (mermaidLib) return mermaidLib;
  try {
    const mod = await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
    mermaidLib = mod.default || mod;
    mermaidLib.initialize({ startOnLoad: false, theme: "default", securityLevel: "strict" });
    return mermaidLib;
  } catch {
    return null;
  }
};

const renderMermaidIn = async (container) => {
  const nodes = container.querySelectorAll(".mermaid");
  if (!nodes.length) return;
  const lib = await loadMermaid();
  if (!lib) return;
  try {
    await lib.run({ nodes: Array.from(nodes) });
  } catch {
    // Keep readable Mermaid source fallback on syntax/offline error
  }
};

const decisionBadge = (type) => {
  if (type === "existing-stack-continuity") return `<span class="badge continuity">Existing Stack Continuity</span>`;
  if (type === "hybrid") return `<span class="badge hybrid">Continuity + Technical Fit</span>`;
  return `<span class="badge tradeoff">Technical Tradeoff</span>`;
};

const triggerDownload = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const buildMarkdown = (prep) => {
  const { roleSummary: role, techLandscape: landscape, points = [], generalAnswers = [], evaluation } = prep;
  const out = [];
  out.push(`# ${role.company} — ${role.role} (Interview Preparation)`);
  out.push("");
  out.push(`- **Version:** ${prep.version || "1.0"}`);
  out.push(`- **Stories:** ${points.length} | **General/STAR Answers:** ${generalAnswers.length} | **Evaluation:** ${evaluation?.status || "draft"}`);
  out.push("");
  out.push("## Role Summary");
  out.push("");
  out.push(`- **Required Technologies:** ${(role.requiredTechnologies || []).join(", ")}`);
  out.push("- **User Workflows:**");
  for (const w of role.userWorkflows || []) out.push(`  - ${w}`);
  out.push("- **Interview Themes:**");
  for (const t of role.interviewThemes || []) out.push(`  - ${t}`);
  out.push("");

  if (landscape?.technologies?.length) {
    out.push("## Tech Landscape Brief");
    out.push("");
    for (const t of landscape.technologies) {
      const eras = (t.typicalVersionsByEra || []).map((e) => `${e.era}: ${e.versions}`).join(" | ");
      out.push(`- **${t.name}** (${t.category || "tech"}): ${t.purpose}${eras ? ` — *Versions:* ${eras}` : ""}`);
    }
    out.push("");
  }

  out.push("## Expanded Résumé Stories");
  out.push("");
  for (const [idx, pt] of points.entries()) {
    out.push("---");
    out.push(`### ${idx + 1}. ${pt.experienceWindow?.source || pt.id} (${pt.experienceWindow?.start || ""} – ${pt.experienceWindow?.end || ""})`);
    out.push("");
    out.push(`**Original Bullet:** ${pt.originalPoint}`);
    out.push("");
    out.push(`- **Product:** ${pt.product}`);
    out.push(`- **User:** ${pt.user}`);
    out.push(`- **Use Case:** ${pt.useCase}`);
    out.push(`- **Business Reason:** ${pt.businessReason}`);
    out.push(`- **Starting Problem:** ${pt.startingProblem}`);
    out.push("");
    out.push("#### What I Did");
    for (const a of pt.actions || []) out.push(`1. ${a}`);
    out.push("");
    if (pt.architecture) {
      out.push("#### Architecture & Setup Flow");
      out.push("");
      out.push(pt.architecture.summary || "");
      out.push("");
      if (pt.architecture.mermaid) {
        out.push("```mermaid");
        out.push(pt.architecture.mermaid);
        out.push("```");
        out.push("");
      }
      for (const c of pt.architecture.components || []) out.push(`- **${c.name}** (${c.layer}): ${c.role}`);
      out.push("");
      out.push("**Request Flow:**");
      for (const step of pt.architecture.requestFlow || []) out.push(`1. ${step}`);
      if (pt.architecture.aiPlacement) out.push(`\n**AI Placement:** ${pt.architecture.aiPlacement}`);
      out.push("");
    }
    if (pt.technologies?.length) {
      out.push("#### Exact Technology Versions & Responsibilities");
      out.push("");
      out.push("| Technology | Exact Version | Responsibility |");
      out.push("|---|---|---|");
      for (const t of pt.technologies) out.push(`| ${t.name} | \`${t.version}\` | ${t.responsibility} |`);
      out.push("");
    }
    if (pt.toolDecisions?.length) {
      out.push("#### Tool Decisions: Why This Tool & Why Not Alternatives?");
      out.push("");
      for (const td of pt.toolDecisions) {
        out.push(`- **${td.tool}** (${td.selectionType || "tradeoff"}): ${td.whyChosen}`);
        for (const alt of td.alternativesConsidered || []) out.push(`  - *Why not ${alt.name}?* ${alt.whyNot}`);
      }
      out.push("");
    }
    if (pt.businessTerms?.length) {
      out.push("#### Business & Domain Terms");
      out.push("");
      for (const bt of pt.businessTerms) out.push(`- **${bt.term}:** ${bt.definition} **How we solved it:** ${bt.howWeSolvedIt}`);
      out.push("");
    }
    if (pt.challenges?.length) {
      out.push("#### Challenges Faced & How We Solved Them");
      out.push("");
      for (const ch of pt.challenges) {
        out.push(`- **${ch.challenge}**`);
        out.push(`  - *Root cause:* ${ch.rootCause}`);
        out.push(`  - *Solution:* ${ch.howWeSolvedIt}`);
        out.push(`  - *Outcome:* ${ch.outcome}`);
      }
      out.push("");
    }
    out.push("#### Result, Impact & Measurements");
    out.push(`- **Result:** ${pt.result}`);
    out.push(`- **Business Impact:** ${pt.businessImpact}`);
    for (const m of pt.measurements || []) {
      out.push(`- **${m.metric}:** Before: ${m.before} → After: ${m.after} | *Calc:* ${m.calculation} | *Evidence:* ${m.evidence}`);
    }
    out.push("");
    if (pt.jdAlignment) {
      out.push(`#### JD Alignment: ${pt.jdAlignment.matchSummary}`);
      for (const h of pt.jdAlignment.hooks || []) out.push(`- **[${h.jdArea}]** "${h.jdText}" — ${h.howThisPointMatches}`);
      out.push("");
    }
    if (pt.collaboration) {
      out.push(`#### Collaboration (${(pt.collaboration.partners || []).join(", ")})`);
      for (const i of pt.collaboration.interactions || []) out.push(`- ${i}`);
      out.push("");
    }
    out.push(`**Role Connection:** ${pt.roleConnection}`);
    out.push("");
    out.push(`**60-Second Spoken Story:** ${pt.fullStory}`);
    out.push("");
    if (pt.interviewerQA?.length) {
      out.push("#### Likely Follow-Up Questions & Model Answers");
      for (const qa of pt.interviewerQA) {
        out.push(`- **Q: ${qa.question}**`);
        out.push(`  - *A:* ${qa.answer}`);
      }
      out.push("");
    } else if (pt.interviewerQuestions?.length) {
      out.push("#### Likely Follow-Up Questions");
      for (const q of pt.interviewerQuestions) out.push(`- ${q}`);
      out.push("");
    }
  }

  out.push("---");
  out.push("## General & Behavioral (CTAR) Answers");
  out.push("");
  for (const ans of generalAnswers) {
    out.push(`### ${ans.question}${ans.targetSeconds ? ` (~${ans.targetSeconds}s)` : ""}`);
    out.push("");
    out.push(ans.answer);
    out.push("");
    if (ans.ctar) {
      out.push(`- **Context:** ${ans.ctar.context || ""}`);
      out.push(`- **Task:** ${ans.ctar.task || ""}`);
      out.push(`- **Action:** ${ans.ctar.action || ""}`);
      out.push(`- **Result:** ${ans.ctar.result || ""}`);
      out.push("");
    }
  }

  if (evaluation?.checks?.length) {
    out.push("---");
    out.push(`## Evaluation Gate (${evaluation.status})`);
    out.push("");
    for (const c of evaluation.checks) out.push(`- **[${c.status.toUpperCase()}] ${c.id}:** ${c.detail}`);
    out.push("");
  }

  return out.join("\n");
};

const renderPointMarkup = (point, { expandQA = false } = {}) => {
  const mermaidBlock = point.architecture?.mermaid
    ? `<div class="mermaid-box"><pre class="mermaid">${esc(point.architecture.mermaid)}</pre></div>`
    : "";

  const architecture = point.architecture
    ? `<div class="section"><h3>Architecture & Setup Flow</h3><p>${esc(point.architecture.summary || "")}</p>${mermaidBlock}<div class="tech-list">${(point.architecture.components || []).map((component) => `<div class="tech"><strong>${esc(component.name)} · ${esc(component.layer)}</strong><span>${esc(component.role)}</span></div>`).join("")}</div><h3 class="subhead">Request flow</h3><ol>${list(point.architecture.requestFlow || [])}</ol>${point.architecture.aiPlacement ? `<p class="note-line"><strong>AI placement:</strong> ${esc(point.architecture.aiPlacement)}</p>` : ""}</div>`
    : "";

  const toolDecisions = (point.toolDecisions || []).length
    ? `<div class="section"><h3>Tool Decisions: Why This Tool & Why Not Alternatives?</h3>${point.toolDecisions.map((td) => `<div class="card-block"><div class="card-head"><strong>${esc(td.tool)}${td.version ? ` <code class="ver">${esc(td.version)}</code>` : ""}</strong>${decisionBadge(td.selectionType)}</div><p>${esc(td.whyChosen)}</p>${(td.alternativesConsidered || []).length ? `<ul class="alt-list">${td.alternativesConsidered.map((alt) => `<li><strong>Why not ${esc(alt.name)}?</strong> ${esc(alt.whyNot)}</li>`).join("")}</ul>` : ""}</div>`).join("")}</div>`
    : "";

  const businessTerms = (point.businessTerms || []).length
    ? `<div class="section"><h3>Relevant Business & Domain Terms (And How We Solved Them)</h3>${point.businessTerms.map((bt) => `<div class="card-block"><strong>${esc(bt.term)}</strong><p>${esc(bt.definition)}</p><p class="solved"><strong>How we solved it:</strong> ${esc(bt.howWeSolvedIt)}</p></div>`).join("")}</div>`
    : "";

  const challenges = (point.challenges || []).length
    ? `<div class="section"><h3>Challenges Faced & How We Solved Them</h3>${point.challenges.map((ch) => `<div class="card-block"><strong>${esc(ch.challenge)}</strong><p><strong>Root cause:</strong> ${esc(ch.rootCause)}</p><p class="solved"><strong>How we solved it:</strong> ${esc(ch.howWeSolvedIt)}</p><p><strong>Outcome:</strong> ${esc(ch.outcome)}</p></div>`).join("")}</div>`
    : "";

  const collab = point.collaboration
    ? `<div class="section"><h3>Collaboration</h3><p><strong>Partners:</strong> ${esc((point.collaboration.partners || []).join(", "))}</p><ol>${list(point.collaboration.interactions || [])}</ol></div>`
    : "";

  const ai = point.aiTooling
    ? `<div class="section"><h3>AI tooling</h3><p>${esc(point.aiTooling.howUsed || "")}</p>${(point.aiTooling.tools || []).length ? `<p class="meta"><strong>Tools:</strong> ${esc(point.aiTooling.tools.join(", "))}</p>` : ""}</div>`
    : "";

  const jd = point.jdAlignment
    ? `<div class="section"><h3>JD match</h3><p>${esc(point.jdAlignment.matchSummary || "")}</p><ol>${list((point.jdAlignment.hooks || []).map((hook) => `${hook.jdArea}: ${hook.jdText} — ${hook.howThisPointMatches}`))}</ol></div>`
    : "";

  const questions = (point.interviewerQA || []).length
    ? `<div class="section"><h3>Likely Follow-Up Questions & Model Answers</h3>${point.interviewerQA.map((qa) => `<details class="qa-item"${expandQA ? " open" : ""}><summary><strong>${esc(qa.question)}</strong></summary><p>${esc(qa.answer)}</p></details>`).join("")}</div>`
    : (point.interviewerQuestions || []).length
      ? `<div class="section"><h3>Likely Follow-Up Questions</h3><ul>${list(point.interviewerQuestions)}</ul></div>`
      : "";

  return `
    <p class="eyebrow">POINT WORKSPACE${point.experienceWindow?.source ? ` · ${esc(point.experienceWindow.source)} (${esc(point.experienceWindow.start || "")}–${esc(point.experienceWindow.end || "")})` : ""}</p>
    <h2>${esc(point.originalPoint)}</h2>
    <div class="story-grid">
      <div><h3>Product</h3><p>${esc(point.product)}</p></div>
      <div><h3>User</h3><p>${esc(point.user)}</p></div>
      <div><h3>Use case</h3><p>${esc(point.useCase)}</p></div>
      <div><h3>Business reason</h3><p>${esc(point.businessReason)}</p></div>
    </div>
    ${jd}
    <div class="section"><h3>Starting problem</h3><p>${esc(point.startingProblem)}</p></div>
    <div class="section"><h3>What I did</h3><ol>${list(point.actions)}</ol></div>
    ${architecture}
    <div class="section"><h3>Exact Technology Versions & Responsibilities</h3>${point.technologies.map((tech) => `<div class="tech"><div><strong>${esc(tech.name)}</strong>${tech.version ? `<div><code class="ver">${esc(tech.version)}</code></div>` : ""}</div><span>${esc(tech.responsibility)}${tech.eraNote ? ` <em>(${esc(tech.eraNote)})</em>` : ""}</span></div>`).join("")}</div>
    ${toolDecisions}
    ${businessTerms}
    ${challenges}
    <div class="section"><h3>Result and business impact</h3><p><strong>Result:</strong> ${esc(point.result)}</p><p><strong>Impact:</strong> ${esc(point.businessImpact)}</p></div>
    <div class="section measurement"><h3>Measurement and evidence</h3>${(point.measurements || []).map((m) => `<dl><dt>Metric</dt><dd>${esc(m.metric)}</dd><dt>Before</dt><dd>${esc(m.before)}</dd><dt>After</dt><dd>${esc(m.after)}</dd><dt>Calculation</dt><dd>${esc(m.calculation)}</dd><dt>Scope</dt><dd>${esc(m.scope)}</dd><dt>Evidence</dt><dd>${esc(m.evidence)}</dd></dl>`).join("")}</div>
    ${collab}
    ${ai}
    <div class="section"><h3>Role connection</h3><p>${esc(point.roleConnection)}</p></div>
    <div class="section full-story"><h3>60-Second Spoken Story</h3><p>${esc(point.fullStory)}</p></div>
    ${questions}`;
};

const buildStandaloneHtml = (prep) => {
  const { roleSummary: role, points = [], generalAnswers = [], evaluation } = prep;
  const allPointsHtml = points
    .map((pt, i) => `<article class="panel point-page"><p class="eyebrow">STORY ${String(i + 1).padStart(2, "0")} OF ${points.length}</p>${renderPointMarkup(pt, { expandQA: true })}</article>`)
    .join("\n");

  const answersHtml = generalAnswers
    .map((answer) => `<article class="answer"><h3>${esc(answer.question)}${answer.targetSeconds ? ` · ~${esc(answer.targetSeconds)}s` : ""}</h3><p>${esc(answer.answer)}</p>${answer.ctar ? `<div class="ctar"><div><strong>Context:</strong> ${esc(answer.ctar.context || "")}</div><div><strong>Task:</strong> ${esc(answer.ctar.task || "")}</div><div><strong>Action:</strong> ${esc(answer.ctar.action || "")}</div><div><strong>Result:</strong> ${esc(answer.ctar.result || "")}</div></div>` : ""}</article>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(role.company)} · ${esc(role.role)} — Full Interview Prep</title>
<style>
:root{--ink:#14233a;--muted:#667895;--line:#dce5f2;--blue:#3b82d0;--pale:#f4f8fd;--panel:#fff;font-family:Inter,ui-sans-serif,system-ui,sans-serif;}
*{box-sizing:border-box;} body{margin:0;background:#f6f9fc;color:var(--ink);line-height:1.6;}
.bar{position:sticky;top:0;z-index:10;background:#11233d;color:#fff;padding:12px 5vw;display:flex;justify-content:space-between;align-items:center;gap:12px;}
.print-btn{background:#3b82d0;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;}
.shell{width:min(1040px,92vw);margin:28px auto 72px;}
.hero{padding:32px 36px;border-radius:22px;background:linear-gradient(120deg,#142b4a,#1e5b8c);color:#fff;margin-bottom:22px;}
.eyebrow{margin:0 0 8px;color:#7890aa;text-transform:uppercase;letter-spacing:.12em;font-size:11px;font-weight:800;}
.hero .eyebrow{color:#b7d5ee;} h1{margin:0;font-size:36px;} h2{margin:0 0 14px;font-size:22px;} h3{margin:0 0 8px;font-size:15px;}
.panel{background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px;margin:20px 0;}
.story-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0;}
.story-grid>div{padding:14px;border-radius:12px;background:var(--pale);}
.section{padding-top:18px;margin-top:18px;border-top:1px solid var(--line);}
.tech{display:grid;grid-template-columns:210px 1fr;gap:14px;padding:10px 0;border-bottom:1px solid var(--line);}
code.ver{display:inline-block;margin-top:4px;padding:2px 7px;border-radius:6px;background:#eaf3ff;color:#184a82;font-size:12px;font-weight:650;}
.mermaid-box{margin:14px 0;padding:14px;border-radius:12px;background:#fbfdff;border:1px solid var(--line);overflow-x:auto;}
.card-block,.qa-item{padding:13px 16px;margin:8px 0;border-radius:12px;background:var(--pale);border:1px solid #e4edf8;}
.card-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px;}
.badge{font-size:11px;font-weight:750;text-transform:uppercase;padding:3px 9px;border-radius:999px;}
.badge.continuity{background:#e6f6ee;color:#116b45;} .badge.hybrid{background:#e8f1ff;color:#1c5296;} .badge.tradeoff{background:#fff3df;color:#8a5600;}
.solved{color:#164a37;} .measurement dl{display:grid;grid-template-columns:130px 1fr;gap:8px 16px;margin:0 0 12px;}
dt{color:#7890aa;font-size:11px;text-transform:uppercase;font-weight:800;} dd{margin:0;color:#4f6380;}
.answer{padding:16px 0;border-top:1px solid var(--line);} .ctar{margin-top:10px;padding:12px;border-radius:10px;background:var(--pale);display:grid;gap:6px;font-size:14px;}
@media print { .bar{display:none;} body{background:#fff;} .shell{width:100%;margin:0;} .point-page{break-before:page;border:none;padding:0;box-shadow:none;} }
</style>
</head>
<body>
<div class="bar"><strong>${esc(role.company)} · ${esc(role.role)} (${points.length} Stories + ${generalAnswers.length} Answers)</strong><button class="print-btn" onclick="window.print()">Print / Save as PDF</button></div>
<main class="shell">
  <section class="hero"><p class="eyebrow">COMPLETE INTERVIEW STUDY PACK · v${esc(prep.version || "1.0")}</p><h1>${esc(role.company)} · ${esc(role.role)}</h1><p>${points.length} expanded stories · ${generalAnswers.length} general &amp; STAR answers · Evaluation: ${esc(evaluation?.status || "draft")}</p></section>
  ${allPointsHtml}
  <section class="panel point-page"><p class="eyebrow">GENERAL &amp; BEHAVIORAL (CTAR) ANSWERS</p><h2>Reusable Spoken Narratives</h2>${answersHtml}</section>
</main>
<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: true, theme: "default", securityLevel: "strict" });
</script>
</body>
</html>`;
};

const render = (prep, runLabel) => {
  currentPrep = prep;
  dlMdBtn.disabled = false;
  dlHtmlBtn.disabled = false;
  dlJsonBtn.disabled = false;

  const { roleSummary: role, techLandscape: landscape, points, generalAnswers, evaluation } = prep;
  const landscapePanel = landscape
    ? `<article class="panel role"><p class="eyebrow">TECH LANDSCAPE</p><h2>Research brief</h2><div class="columns"><div><h3>Framework gaps</h3><ul>${list((landscape.technologies || []).slice(0, 5).map((tech) => `${tech.name}: ${(tech.currentGaps || []).slice(0, 1).join("") || tech.purpose}`))}</ul></div><div><h3>Collaboration</h3><ul>${list((landscape.collaborationNorms || []).flatMap((norm) => norm.partners || []).slice(0, 6))}</ul></div><div><h3>AI tooling from ${esc(landscape.aiAssistedWork?.appliesFrom || "2024")}</h3><ul>${list(landscape.aiAssistedWork?.tools || [])}</ul></div></div></article>`
    : "";

  const docsBar = currentRunDocs.length
    ? `<div class="docs-bar"><span class="docs-label">Run guides &amp; prompts:</span>${currentRunDocs.map((doc) => doc.kind === "html" ? `<a class="doc-pill html" href="${esc(doc.url)}" target="_blank" rel="noopener">${esc(doc.name)} ↗</a>` : `<button type="button" class="doc-pill md" data-doc-url="${esc(doc.url)}" data-doc-name="${esc(doc.name)}">${esc(doc.name)}</button>`).join("")}</div>`
    : "";

  app.innerHTML = `
    <section class="hero"><p class="eyebrow">PREPARATION ENGINE · ${esc(prep.version)}</p><h1>${esc(role.company)} · ${esc(role.role)}</h1><p class="lede">A structured, evidence-first preparation generated from the role context and résumé points.</p><div class="chips"><span>${points.length} stor${points.length === 1 ? "y" : "ies"}</span><span>${generalAnswers.length} general answer${generalAnswers.length === 1 ? "" : "s"}</span><span>${esc(evaluation.status)}</span></div>${docsBar}</section>
    <dialog id="doc-modal" class="doc-modal"><div class="doc-modal-head"><strong id="doc-modal-title"></strong><div class="doc-modal-actions"><button type="button" id="doc-copy" class="dl-btn">Copy</button><button type="button" id="doc-close" class="dl-btn">Close</button></div></div><pre id="doc-modal-body" class="doc-modal-body"></pre></dialog>
    <section class="grid"><article class="panel role"><p class="eyebrow">ROLE SUMMARY</p><h2>What this role evaluates</h2><div class="columns"><div><h3>Technologies</h3><ul>${list(role.requiredTechnologies)}</ul></div><div><h3>User workflows</h3><ul>${list(role.userWorkflows)}</ul></div><div><h3>Interview themes</h3><ul>${list(role.interviewThemes)}</ul></div></div></article>${landscapePanel}
    <div class="content-layout"><aside class="point-list"><p class="eyebrow">RÉSUMÉ POINTS (${points.length})</p>${points.map((point, index) => `<button class="point-button ${index === 0 ? "active" : ""}" data-point="${esc(point.id)}"><span>${String(index + 1).padStart(2, "0")}</span><div><small class="point-source">${esc(point.experienceWindow?.source || "")}${point.experienceWindow?.start ? ` · ${esc(point.experienceWindow.start)}–${esc(point.experienceWindow.end || "")}` : ""}</small><strong>${esc(point.originalPoint)}</strong></div></button>`).join("")}</aside><article id="detail" class="panel detail"></article></div>
    <section class="panel answers"><p class="eyebrow">GENERAL QUESTIONS</p><h2>Reusable interview narratives</h2>${generalAnswers.map((answer) => `<article class="answer"><h3>${esc(answer.question)}${answer.targetSeconds ? ` · ~${esc(answer.targetSeconds)}s` : ""}</h3><p>${esc(answer.answer)}</p>${answer.ctar ? `<div class="ctar"><div><strong>Context:</strong> ${esc(answer.ctar.context || "")}</div><div><strong>Task:</strong> ${esc(answer.ctar.task || "")}</div><div><strong>Action:</strong> ${esc(answer.ctar.action || "")}</div><div><strong>Result:</strong> ${esc(answer.ctar.result || "")}</div></div>` : ""}</article>`).join("")}</section>
    <section class="panel eval"><p class="eyebrow">EVALUATION</p><h2>Finalization gate</h2>${evaluation.checks.map((check) => `<div class="check"><span class="${esc(check.status)}">${esc(check.status)}</span><strong>${esc(check.id)}</strong><p>${esc(check.detail)}</p></div>`).join("")}</section>`;

  const detail = document.querySelector("#detail");
  const show = async (id) => {
    const point = points.find((item) => item.id === id) || points[0];
    document.querySelectorAll(".point-button").forEach((button) => button.classList.toggle("active", button.dataset.point === point.id));
    detail.innerHTML = renderPointMarkup(point, { expandQA: false });
    await renderMermaidIn(detail);
  };

  document.querySelectorAll(".point-button").forEach((button) =>
    button.addEventListener("click", () => show(button.dataset.point))
  );
  const modal = document.querySelector("#doc-modal");
  const modalTitle = document.querySelector("#doc-modal-title");
  const modalBody = document.querySelector("#doc-modal-body");
  const copyBtn = document.querySelector("#doc-copy");
  const closeBtn = document.querySelector("#doc-close");
  if (modal && closeBtn && copyBtn) {
    closeBtn.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(modalBody.textContent || "");
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.textContent = "Copy"; }, 1200);
      } catch {
        copyBtn.textContent = "Copy failed";
      }
    });
    document.querySelectorAll("button.doc-pill").forEach((btn) => {
      btn.addEventListener("click", async () => {
        modalTitle.textContent = btn.dataset.docName || "Document";
        modalBody.textContent = "Loading…";
        modal.showModal();
        try {
          const res = await fetch(btn.dataset.docUrl);
          modalBody.textContent = await res.text();
        } catch (err) {
          modalBody.textContent = `Could not load file: ${err.message}`;
        }
      });
    });
  }
  show(points[0].id);
  status.textContent = runLabel || "Loaded";
};

dlJsonBtn.addEventListener("click", () => {
  if (!currentPrep) return;
  triggerDownload(`${currentRunId}-preparation.json`, JSON.stringify(currentPrep, null, 2) + "\n", "application/json;charset=utf-8");
});

dlMdBtn.addEventListener("click", () => {
  if (!currentPrep) return;
  triggerDownload(`${currentRunId}-study-guide.md`, buildMarkdown(currentPrep), "text/markdown;charset=utf-8");
});

dlHtmlBtn.addEventListener("click", () => {
  if (!currentPrep) return;
  triggerDownload(`${currentRunId}-full-prep.html`, buildStandaloneHtml(currentPrep), "text/html;charset=utf-8");
});

const loadRun = async (run) => {
  currentRunId = run.id;
  currentRunDocs = run.docs || [];
  currentPrep = null;
  dlMdBtn.disabled = true;
  dlHtmlBtn.disabled = true;
  dlJsonBtn.disabled = true;
  status.textContent = `Loading ${run.id}…`;
  try {
    const response = await fetch(run.url);
    if (!response.ok) throw new Error(`HTTP ${response.status} loading ${run.url}`);
    const prep = await response.json();
    render(prep, run.label);
  } catch (error) {
    status.textContent = "Load failed";
    app.innerHTML = `<section class="panel"><h1>Preparation could not load</h1><p>${esc(error.message)}</p></section>`;
  }
};

const boot = async () => {
  try {
    const res = await fetch("/api/runs");
    const { runs } = await res.json();
    const requested = new URLSearchParams(window.location.search).get("run");
    const initial = runs.find((r) => r.id === requested) || runs[0];

    runSelect.innerHTML = runs
      .map((r) => `<option value="${esc(r.id)}" ${r.id === initial.id ? "selected" : ""}>${esc(r.label)}</option>`)
      .join("");

    runSelect.addEventListener("change", () => {
      const next = runs.find((r) => r.id === runSelect.value);
      if (!next) return;
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("run", next.id);
      window.history.replaceState({}, "", nextUrl);
      loadRun(next);
    });

    await loadRun(initial);
  } catch {
    await loadRun({ id: "instrumental-demo", label: "Demo", url: "/data/instrumental-demo.json" });
  }
};

boot();
