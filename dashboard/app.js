const app = document.querySelector("#app");
const status = document.querySelector("#status");
const esc = (value = "") => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
const list = (items = []) => items.map((item) => `<li>${esc(item)}</li>`).join("");

const render = (prep) => {
  const { roleSummary: role, points, generalAnswers, evaluation } = prep;
  app.innerHTML = `
    <section class="hero"><p class="eyebrow">PREPARATION ENGINE · ${esc(prep.version)}</p><h1>${esc(role.company)} · ${esc(role.role)}</h1><p class="lede">A structured, evidence-first preparation generated from the role context and résumé points.</p><div class="chips"><span>${points.length} story${points.length === 1 ? "" : "ies"}</span><span>${generalAnswers.length} general answer${generalAnswers.length === 1 ? "" : "s"}</span><span>${esc(evaluation.status)}</span></div></section>
    <section class="grid"><article class="panel role"><p class="eyebrow">ROLE SUMMARY</p><h2>What this role evaluates</h2><div class="columns"><div><h3>Technologies</h3><ul>${list(role.requiredTechnologies)}</ul></div><div><h3>User workflows</h3><ul>${list(role.userWorkflows)}</ul></div><div><h3>Interview themes</h3><ul>${list(role.interviewThemes)}</ul></div></div></article>
    <div class="content-layout"><aside class="point-list"><p class="eyebrow">RÉSUMÉ POINTS</p>${points.map((point, index) => `<button class="point-button ${index === 0 ? "active" : ""}" data-point="${esc(point.id)}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(point.originalPoint)}</strong></button>`).join("")}</aside><article id="detail" class="panel detail"></article></div>
    <section class="panel answers"><p class="eyebrow">GENERAL QUESTIONS</p><h2>Reusable interview narratives</h2>${generalAnswers.map((answer) => `<article class="answer"><h3>${esc(answer.question)}</h3><p>${esc(answer.answer)}</p></article>`).join("")}</section>
    <section class="panel eval"><p class="eyebrow">EVALUATION</p><h2>Finalization gate</h2>${evaluation.checks.map((check) => `<div class="check"><span class="${check.status}">${check.status}</span><strong>${esc(check.id)}</strong><p>${esc(check.detail)}</p></div>`).join("")}</section>`;
  const detail = document.querySelector("#detail");
  const show = (id) => {
    const point = points.find((item) => item.id === id) || points[0];
    document.querySelectorAll(".point-button").forEach((button) => button.classList.toggle("active", button.dataset.point === point.id));
    detail.innerHTML = `<p class="eyebrow">POINT WORKSPACE</p><h2>${esc(point.originalPoint)}</h2><div class="story-grid"><div><h3>Product</h3><p>${esc(point.product)}</p></div><div><h3>User</h3><p>${esc(point.user)}</p></div><div><h3>Use case</h3><p>${esc(point.useCase)}</p></div><div><h3>Business reason</h3><p>${esc(point.businessReason)}</p></div></div><div class="section"><h3>Starting problem</h3><p>${esc(point.startingProblem)}</p></div><div class="section"><h3>What I did</h3><ol>${list(point.actions)}</ol></div><div class="section"><h3>Result and business impact</h3><p><strong>Result:</strong> ${esc(point.result)}</p><p><strong>Impact:</strong> ${esc(point.businessImpact)}</p></div><div class="section"><h3>Technology responsibilities</h3>${point.technologies.map((tech) => `<div class="tech"><strong>${esc(tech.name)}</strong><span>${esc(tech.responsibility)}</span></div>`).join("")}</div><div class="section measurement"><h3>Measurement and evidence</h3>${(point.measurements || []).map((m) => `<dl><dt>Metric</dt><dd>${esc(m.metric)}</dd><dt>Before</dt><dd>${esc(m.before)}</dd><dt>After</dt><dd>${esc(m.after)}</dd><dt>Calculation</dt><dd>${esc(m.calculation)}</dd><dt>Scope</dt><dd>${esc(m.scope)}</dd><dt>Evidence</dt><dd>${esc(m.evidence)}</dd></dl>`).join("")}</div><div class="section"><h3>Role connection</h3><p>${esc(point.roleConnection)}</p></div><div class="section full-story"><h3>Full story</h3><p>${esc(point.fullStory)}</p></div>`;
  };
  document.querySelectorAll(".point-button").forEach((button) => button.addEventListener("click", () => show(button.dataset.point)));
  show(points[0].id);
  status.textContent = "Schema-ready demo";
};

fetch("/data/instrumental-demo.json").then((response) => response.json()).then(render).catch((error) => { status.textContent = "Load failed"; app.innerHTML = `<section class="panel"><h1>Preparation could not load</h1><p>${esc(error.message)}</p></section>`; });
