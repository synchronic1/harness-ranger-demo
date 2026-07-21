const controls = [
  ["structured", "Structured-context preservation", "Core prompt and compaction protection", true],
  ["crossJudge", "Cross-judge evaluation", "Independent quality checks before promotion"],
  ["replay", "Replay cache", "Diagnostic evaluation cache"],
  ["temporal", "Temporal event lookup", "Time-scoped evidence selection"],
];

const baseMetrics = { suite: "31 / 31 passing", benchmark: "72 paired tasks", aa: "Calibrated", success: "+3.4 pp", safety: "0 severe", tokens: "−12%", cost: "−13%", latency: "−8%", quality: "0.92", stage: "Stable promotion" };
const judgeModels = ["Qwen2.5-7B-Instruct", "Llama-3.1-8B-Instruct", "Mistral-7B-Instruct"];
const judgeProfiles = {
  codex: { model: "Qwen2.5-7B-Instruct", gpuDetected: true, gpu: true, cache: "184 immutable verdicts", status: "Ready offline" },
  openclaw: { model: "Llama-3.1-8B-Instruct", gpuDetected: false, gpu: false, cache: "No verdict cache", status: "Runner verification required" },
  langgraph: { model: "Qwen2.5-7B-Instruct", gpuDetected: true, gpu: true, cache: "96 immutable verdicts", status: "Ready offline" },
  http: { model: "Mistral-7B-Instruct", gpuDetected: true, gpu: false, cache: "Last cache retained", status: "Blocked by degraded connector" },
};

let harnesses = [
  { id: "codex", name: "Codex / West Production", type: "Codex Harness", connector: "ranger-codex 1.8.0", state: "active", location: "cloud", environment: "production", endpoint: "https://codex-west.internal", team: "Platform AI", verified: "8 min ago", settings: { structured: true, crossJudge: true, replay: false, temporal: true }, evolution: { on: true, mode: "evaluate", artifact: "formatting_policy · sha256:4e7…" }, metrics: baseMetrics },
  { id: "openclaw", name: "Evaluation Lab", type: "OpenClaw Harness", connector: "ranger-openclaw 0.9.4", state: "draft", location: "local", environment: "development", endpoint: "C:\\AgentRuntimes\\evaluation-lab", team: "Applied Research", verified: "Not verified", settings: { structured: true, crossJudge: true, replay: false, temporal: false }, evolution: { on: false, mode: "observe", artifact: "No artifact selected" }, metrics: { ...baseMetrics, suite: "Awaiting Runner", benchmark: "0 / 50 tasks", aa: "Not calibrated", success: "—", safety: "—", tokens: "—", cost: "—", latency: "—", quality: "—", stage: "Regression gate" } },
  { id: "langgraph", name: "Claims assistant / staging", type: "LangGraph Harness", connector: "ranger-langgraph 1.1.2", state: "active", location: "private network", environment: "staging", endpoint: "https://claims-agent.service.cluster", team: "Operations AI", verified: "26 min ago", settings: { structured: true, crossJudge: true, replay: true, temporal: true }, evolution: { on: true, mode: "auto-canary", artifact: "tool_descriptions · sha256:b91…" }, metrics: { ...baseMetrics, benchmark: "118 paired tasks", success: "+4.1 pp", tokens: "−9%", cost: "−10%", latency: "−6%", stage: "Limited live canary" } },
  { id: "http", name: "Retail agent canary", type: "Custom HTTP Harness", connector: "ranger-http 1.2.1", state: "degraded", location: "cloud", environment: "production", endpoint: "https://retail-agent.internal", team: "Commerce", verified: "Failed 12 min ago", settings: { structured: true, crossJudge: false, replay: false, temporal: false }, evolution: { on: false, mode: "observe", artifact: "prompt_sections · sha256:77c…" }, metrics: { ...baseMetrics, suite: "28 / 31 passing", benchmark: "48 / 50 tasks", aa: "Blocked", success: "−0.8 pp", safety: "1 warning", tokens: "+2%", cost: "+1%", latency: "+6%", quality: "0.84", stage: "Rollback hold" } },
];

let selected = "codex";
let filter = "all";
let search = "";
let dialog = false;
let banner = "";
const label = { active: "Active", draft: "Draft", degraded: "Degraded", verifying: "Verifying" };

function render() {
  const current = harnesses.find((h) => h.id === selected) || harnesses[0];
  const visible = harnesses.filter((h) => (filter === "all" || h.state === filter) && `${h.name} ${h.type} ${h.team}`.toLowerCase().includes(search.toLowerCase()));
  const count = (state) => harnesses.filter((h) => h.state === state).length;
  document.querySelector("#app").innerHTML = `
    <header class="top"><div class="brand"><span class="mark">⌁</span> HARNESS RANGER <em>INTERACTIVE DEMO</em></div><nav class="top-links" aria-label="Demo resources"><a href="docs/harness-ranger-evaluation-methodology.pdf" target="_blank">Evaluation methodology PDF</a><a href="flow.html">System flow</a></nav><span class="mode">DEMO DATA · NO LIVE CONNECTIONS</span></header>
    <section class="hero"><div><p class="eyebrow">OPERATIONS / HARNESS INVENTORY</p><h1>Agent Harness Optimization.</h1><p>Measure, govern, and safely evolve the operating artifacts behind cloud, private-network, and local agent harnesses.</p></div><button class="primary" data-action="open">+ Add harness instance</button></section>
    ${banner ? `<div class="banner">${banner}</div>` : ""}
    <section class="metrics"><article class="metric green"><p>Active integrations</p><strong>${String(count("active")).padStart(2, "0")}</strong><small>verified and enabled</small></article><article class="metric amber"><p>Needs attention</p><strong>${String(count("degraded")).padStart(2, "0")}</strong><small>failed check or policy</small></article><article class="metric"><p>Draft connections</p><strong>${String(count("draft")).padStart(2, "0")}</strong><small>awaiting verification</small></article><article class="metric blue"><p>Known connectors</p><strong>04</strong><small>illustrative catalog</small></article></section>
    <section class="workspace"><aside class="inventory"><div class="head"><div><p class="eyebrow">INVENTORY</p><h2>Harness instances</h2></div><span>${harnesses.length} total</span></div><input class="search" id="search" value="${search}" placeholder="Search name, type, or team"/><div class="filters">${["all", "active", "degraded", "draft"].map((state) => `<button class="${filter === state ? "on" : ""}" data-filter="${state}">${state === "all" ? "All" : label[state]}</button>`).join("")}</div><div class="list">${visible.map((h) => `<button class="harness ${h.id === current.id ? "on" : ""}" data-select="${h.id}"><span class="status ${h.state}"></span><span class="copy"><strong>${h.name}</strong><small>${h.type} · ${h.environment}</small></span><span class="chev">›</span></button>`).join("")}</div></aside><section class="detail">${detail(current)}</section></section>${dialog ? modal() : ""}`;
  bind();
}

function detail(h) {
  return `<div class="detail-head"><div><p class="eyebrow">${h.type.toUpperCase()} / ${h.connector.toUpperCase()}</p><h2>${h.name}</h2><div class="badges"><span class="badge ${h.state}">${label[h.state]}</span><span class="badge">${h.location}</span><span class="badge">${h.environment}</span></div></div><div class="action-set"><button class="secondary" data-action="verify">${h.state === "draft" ? "Verify connection" : "Run verification"}</button><button class="secondary" data-action="archive">Archive instance</button></div></div>
  <div class="grid evolution-grid">
    <article class="card implementation"><p class="eyebrow">IMPLEMENTATION</p><dl><dt>Integration state</dt><dd><span class="status ${h.state}"></span> ${label[h.state]}</dd><dt>Location</dt><dd class="mono">${h.endpoint}</dd><dt>Owner team</dt><dd>${h.team}</dd><dt>Last verification</dt><dd>${h.verified}</dd></dl><span class="link">All configuration actions are auditable.</span></article>
    ${controlCard(h)}
    ${metricsCard(h)}
    ${evolutionCard(h)}
    ${judgeCard(h)}
  </div><article class="health"><div><p class="eyebrow">CONNECTOR STATUS</p><h3>${h.state === "degraded" ? "Endpoint health check failed" : h.state === "draft" ? "Connection has not been verified" : "Connector handshake passed"}</h3><p>${h.state === "degraded" ? "The Connector Runner could not reach the endpoint. Resolve routing or credentials, then rerun verification." : h.location === "local" ? "The local path is available only to its approved Connector Runner." : "No browser-to-harness connection is made from this dashboard."}</p></div><button class="secondary" data-action="audit">Open audit history</button></article>`;
}

function controlCard(h) {
  const active = h.state === "active";
  return `<article class="card controls"><p class="eyebrow">HARNESS RANGER CONTROLS</p><h3>Operational safeguards</h3><p class="policy-note">Keep diagnostic and integration-dependent behavior as status or actions. Only a small number of operational controls are mutable.</p><div class="feature-list">${controls.map(([key, name, note, core]) => { const disabled = !core && !active; const helper = key === "crossJudge" && !h.settings[key] ? "Requires two judges and cached evaluation inputs" : key === "replay" && !h.evolution.on ? "Enable Self‑Evolution telemetry first" : note; return `<label class="feature ${disabled ? "locked" : ""}"><input type="checkbox" data-setting="${key}" ${h.settings[key] ? "checked" : ""} ${disabled ? "disabled" : ""}/><span><strong>${name}</strong><small>${helper}</small></span></label>`; }).join("")}</div><div class="diagnostics"><button class="secondary compact" data-action="coverage">Run evidence coverage</button><button class="secondary compact" data-action="baseline">Record adapter latency baseline</button></div></article>`;
}

function metricsCard(h) {
  const m = h.metrics;
  return `<article class="card measured"><p class="eyebrow">MEASURED METRICS</p><h3>Paired, graded evaluation</h3><p class="policy-note">Deterministic tests protect the evolution machinery; paired outcomes prove whether a candidate artifact improves behavior.</p><div class="gate-row"><span>Regression gate</span><strong>${m.suite}</strong></div><div class="gate-row"><span>Offline benchmark</span><strong>${m.benchmark}</strong></div><div class="gate-row"><span>A/A control</span><strong>${m.aa}</strong></div><div class="stage">${m.stage}</div><div class="scorecard"><div><small>Task success</small><strong>${m.success}</strong></div><div><small>Severe safety</small><strong>${m.safety}</strong></div><div><small>Token use</small><strong>${m.tokens}</strong></div><div><small>Cost</small><strong>${m.cost}</strong></div><div><small>p95 latency</small><strong>${m.latency}</strong></div><div><small>Grader quality</small><strong>${m.quality}</strong></div></div><p class="suite-copy">Suite coverage: candidate validation/redaction, offline and canary gates, promotion/rollback pointers, host-template parity, and safety/cost/token/latency thresholds.</p></article>`;
}

function evolutionCard(h) {
  const active = h.state === "active";
  const autoReady = h.metrics.aa === "Calibrated" && h.metrics.stage !== "Rollback hold";
  return `<article class="card self-evolution"><p class="eyebrow">SELF‑EVOLUTION</p><h3>Guarded artifact improvement</h3><p class="policy-note">Self‑Evolution is artifact-level self-learning: prompt sections, tool descriptions, and skills are compared independently with causal tasks.</p><label class="master"><input type="checkbox" data-evolution="master" ${h.evolution.on ? "checked" : ""} ${active ? "" : "disabled"}/><span><strong>Self‑Evolution telemetry</strong><small>Master control · ${h.evolution.on ? "on" : "off"}</small></span></label><div class="modes" role="group" aria-label="Evolution mode">${[["observe", "Observe", !h.evolution.on], ["evaluate", "Evaluate", !h.evolution.on], ["auto-canary", "Auto‑canary", !h.evolution.on || !autoReady]].map(([mode, text, disabled]) => `<button class="${h.evolution.mode === mode ? "chosen" : ""}" data-mode="${mode}" ${disabled ? "disabled" : ""}>${text}</button>`).join("")}</div><div class="evolution-funnel"><span class="done">Regression suite</span><span>→</span><span class="done">Paired benchmark ≥50</span><span>→</span><span class="${autoReady ? "done" : "hold"}">A/A control</span><span>→</span><span class="${h.evolution.mode === "auto-canary" ? "done" : "hold"}">Live canary ≥100</span><span>→</span><span class="hold">Promotion / rollback</span></div><dl class="artifact"><dt>Candidate artifact</dt><dd>${h.evolution.artifact}</dd><dt>Promotion rule</dt><dd>${h.metrics.stage === "Rollback hold" ? "Blocked pending safety and benchmark recovery" : "No severe safety regression; success improves; thresholds hold"}</dd></dl></article>`;
}

function judgeFor(h) {
  return { model: judgeModels[0], gpuDetected: false, gpu: false, cache: "No verdict cache", status: "Runner verification required", ...(judgeProfiles[h.id] || {}), ...(h.judge || {}) };
}

function judgeCard(h) {
  const judge = judgeFor(h);
  const canRun = h.state === "active" && judge.status === "Ready offline";
  return `<article class="card llm-judge"><p class="eyebrow">LLM JUDGE</p><h3>Offline verdict provider</h3><p class="policy-note">Explicit local evaluation only. The Judge never runs from hooks and never promotes a candidate by itself.</p><label class="judge-field">Local model<select data-judge-model>${judgeModels.map((model) => `<option ${judge.model === model ? "selected" : ""}>${model}</option>`).join("")}</select></label><label class="master ${(!judge.gpuDetected || h.state !== "active") ? "locked" : ""}"><input type="checkbox" data-judge-gpu ${judge.gpu ? "checked" : ""} ${(!judge.gpuDetected || h.state !== "active") ? "disabled" : ""}/><span><strong>GPU processing</strong><small>${judge.gpuDetected ? "Local CUDA worker detected on deployment" : "No local CUDA worker detected"}</small></span></label><div class="judge-status"><span>${judge.status}</span><strong>${judge.cache}</strong></div><ul class="judge-rules"><li>Bounded and redacted evaluation cases</li><li>Schema-constrained pass / fail / abstain JSON</li><li>Unsupported evidence citations rejected</li></ul><button class="secondary compact" data-action="judge" ${canRun ? "" : "disabled"}>Run local Judge evaluation</button></article>`;
}

function modal() { return `<div class="dialog-backdrop"><form class="dialog" id="create"><div class="dialog-head"><div><p class="eyebrow">NEW IMPLEMENTATION</p><h2>Add harness instance</h2></div><button class="close" type="button" data-action="close">×</button></div><label>Instance name<input name="name" required placeholder="Support agent / production"/></label><label>Harness type<select name="type"><option>Codex Harness</option><option>OpenClaw Harness</option><option>LangGraph Harness</option><option>Custom HTTP Harness</option></select></label><div class="row"><label>Location<select name="location"><option>cloud</option><option>private network</option><option>local</option></select></label><label>Environment<select name="environment"><option>development</option><option>staging</option><option>production</option></select></label></div><label>Endpoint or local path<input name="endpoint" required placeholder="https://… or C:\\…"/></label><p class="demo-note">Demo mode only. Credentials are intentionally not collected here.</p><div class="actions"><button class="secondary" type="button" data-action="close">Cancel</button><button class="primary">Save as draft</button></div></form></div>`; }

function bind() {
  document.querySelectorAll("[data-select]").forEach((el) => el.onclick = () => { selected = el.dataset.select; render(); });
  document.querySelectorAll("[data-filter]").forEach((el) => el.onclick = () => { filter = el.dataset.filter; render(); });
  document.querySelector("#search").oninput = (event) => { search = event.target.value; render(); };
  document.querySelectorAll("[data-setting]").forEach((el) => el.onchange = () => { const h = harnesses.find((item) => item.id === selected); h.settings[el.dataset.setting] = el.checked; banner = `${el.parentElement.innerText.split("\n")[0]} ${el.checked ? "enabled" : "disabled"} for ${h.name}.`; render(); });
  document.querySelectorAll("[data-judge-model]").forEach((el) => el.onchange = () => { const h = harnesses.find((item) => item.id === selected); h.judge = { ...judgeFor(h), model: el.value }; banner = `LLM Judge model set to ${el.value} for ${h.name}.`; render(); });
  document.querySelectorAll("[data-judge-gpu]").forEach((el) => el.onchange = () => { const h = harnesses.find((item) => item.id === selected); h.judge = { ...judgeFor(h), gpu: el.checked }; banner = `GPU processing ${el.checked ? "enabled" : "disabled"} for the local Judge worker.`; render(); });
  document.querySelectorAll("[data-evolution]").forEach((el) => el.onchange = () => { const h = harnesses.find((item) => item.id === selected); h.evolution.on = el.checked; if (!el.checked) h.evolution.mode = "observe"; banner = `Self‑Evolution ${el.checked ? "enabled" : "paused"} for ${h.name}.`; render(); });
  document.querySelectorAll("[data-mode]").forEach((el) => el.onclick = () => { const h = harnesses.find((item) => item.id === selected); h.evolution.mode = el.dataset.mode; banner = `Evolution mode changed to ${el.innerText} for ${h.name}.`; render(); });
  document.querySelectorAll("[data-action]").forEach((el) => el.onclick = () => { const action = el.dataset.action; const h = harnesses.find((item) => item.id === selected); if (action === "open") dialog = true; if (action === "close") dialog = false; if (action === "verify") { h.state = "verifying"; h.verified = "Queued just now"; banner = "Verification queued for the assigned Connector Runner."; } if (action === "archive") banner = `${h.name} would be archived and retained in the audit trail.`; if (action === "audit") banner = "Audit history: policy updates, verification jobs, artifact versions, and lifecycle actions are retained."; if (action === "coverage") banner = "Evidence-coverage diagnostic requested. It records a metric; it does not alter runtime behavior."; if (action === "baseline") banner = "Adapter latency baseline requested for the selected benchmark fixtures."; if (action === "judge") banner = "Local Judge evaluation queued with bounded, redacted input. Its verdict is cached and remains insufficient for promotion alone."; render(); });
  const form = document.querySelector("#create"); if (form) form.onsubmit = (event) => { event.preventDefault(); const d = new FormData(form); const id = `demo-${Date.now()}`; harnesses.push({ id, name: d.get("name"), type: d.get("type"), connector: "ranger-demo 1.0", state: "draft", location: d.get("location"), environment: d.get("environment"), endpoint: d.get("endpoint"), team: "Demo team", verified: "Not verified", settings: { structured: true, crossJudge: false, replay: false, temporal: false }, evolution: { on: false, mode: "observe", artifact: "No artifact selected" }, metrics: { ...baseMetrics, suite: "Awaiting Runner", benchmark: "0 / 50 tasks", aa: "Not calibrated", success: "—", safety: "—", tokens: "—", cost: "—", latency: "—", quality: "—", stage: "Regression gate" } }); selected = id; dialog = false; banner = "New demo harness saved as a draft."; render(); };
}

render();
