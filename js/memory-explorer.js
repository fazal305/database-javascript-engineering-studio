(function () {
  "use strict";
  const S = EngineeringStudio;
  let scenarios,
    current,
    reachable = new Set();
  function calculateReachability() {
    reachable = new Set();
    const visit = (id) => {
      if (reachable.has(id)) return;
      reachable.add(id);
      current.nodes.find((n) => n.id === id)?.references.forEach(visit);
    };
    current.nodes.filter((n) => n.type === "stack").forEach((n) => visit(n.id));
    renderMemoryGraph();
    renderGarbageCandidates();
    return reachable;
  }
  function renderMemoryGraph() {
    document.querySelector("#memory-stack").innerHTML =
      current.nodes
        .filter((n) => n.type === "stack")
        .map(
          (n) =>
            `<div class="list-item"><strong>${S.escapeHtml(n.label)}</strong><div class="help">→ ${n.references.join(", ") || "none"}</div></div>`,
        )
        .join("") || S.renderEmptyState("No stack roots remain.");
    document.querySelector("#memory-heap").innerHTML = current.nodes
      .filter((n) => n.type === "heap")
      .map(
        (n) =>
          `<div class="memory-node ${reachable.size && !reachable.has(n.id) ? "garbage" : ""}">${S.escapeHtml(n.label)}</div>`,
      )
      .join("");
    drawMemoryReferences();
  }
  function drawMemoryReferences() {
    const edges = current.nodes.flatMap((n) =>
      n.references.map(
        (r) =>
          `${n.label} → ${current.nodes.find((x) => x.id === r)?.label || r}`,
      ),
    );
    document.querySelector("#memory-links").innerHTML = edges
      .map(
        (e, i) =>
          `<text x="20" y="${25 + i * 20}" fill="var(--muted)">${S.escapeHtml(e)}</text>`,
      )
      .join("");
  }
  function renderStackFrames() {
    renderMemoryGraph();
  }
  function renderHeapObjects() {
    renderMemoryGraph();
  }
  function createMemoryObject() {
    current.nodes.push({
      id: S.generateId("obj"),
      type: "heap",
      label: `Object ${current.nodes.length}`,
      references: [],
    });
    renderMemoryGraph();
  }
  function createReference() {
    const root = current.nodes.find((n) => n.type === "stack"),
      obj = current.nodes.find(
        (n) => n.type === "heap" && !root?.references.includes(n.id),
      );
    if (root && obj) root.references.push(obj.id);
    renderMemoryGraph();
  }
  function removeReference() {
    const root = current.nodes.find((n) => n.type === "stack");
    if (root) root.references.pop();
    renderMemoryGraph();
  }
  function findReachableObjects() {
    return calculateReachability();
  }
  function markGarbageCandidates() {
    calculateReachability();
  }
  function renderGarbageCandidates() {
    const garbage = current.nodes.filter(
      (n) => n.type === "heap" && !reachable.has(n.id),
    );
    document.querySelector("#garbage-candidates").innerHTML = garbage.length
      ? garbage
          .map(
            (n) =>
              `<span class="badge">${S.escapeHtml(n.label)} · unreachable</span>`,
          )
          .join(" ")
      : S.renderEmptyState("No unreachable heap objects in this graph.");
  }
  function load(id) {
    current = S.safeClone(scenarios.find((x) => x.id === id) || scenarios[0]);
    reachable = new Set();
    renderMemoryGraph();
    document.querySelector("#garbage-candidates").innerHTML =
      S.renderEmptyState("Calculate reachability to identify candidates.");
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("memory-explorer");
    scenarios = S.loadWorkspace().memoryScenarios;
    const sel = document.querySelector("#memory-scenario");
    sel.innerHTML = scenarios
      .map((x) => `<option value="${x.id}">${S.escapeHtml(x.name)}</option>`)
      .join("");
    load(scenarios[0].id);
    sel.onchange = (e) => load(e.target.value);
    document.querySelector("#add-memory-node").onclick = createMemoryObject;
    document.querySelector("#remove-reference").onclick = removeReference;
    document.querySelector("#collect-garbage").onclick = calculateReachability;
  });
  Object.assign(window, {
    renderStackFrames,
    renderHeapObjects,
    createMemoryObject,
    createReference,
    removeReference,
    drawMemoryReferences,
    calculateReachability,
    findReachableObjects,
    markGarbageCandidates,
    renderGarbageCandidates,
  });
})();
