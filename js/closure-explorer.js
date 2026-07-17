(function () {
  "use strict";
  const S = EngineeringStudio;
  let scenarios,
    current,
    closures = [],
    timeline = [];
  function renderClosureExplorer() {
    document.querySelector("#outer-scope").innerHTML =
      `<div class="scope-value">factory: ${S.escapeHtml(current.name)}</div><div class="scope-value">seed: ${current.outer.seed}</div>`;
    document.querySelector("#retained-scope").innerHTML =
      closures
        .map(
          (c) =>
            `<div class="scope-value">${S.escapeHtml(c.name)} retains value = ${c.value}</div>`,
        )
        .join("") || S.renderEmptyState("No environments retained yet.");
    document.querySelector("#closure-instances").innerHTML =
      closures
        .map(
          (c) =>
            `<button class="list-item closure-select" data-id="${c.id}">${S.escapeHtml(c.name)} · value ${c.value}</button>`,
        )
        .join("") ||
      S.renderEmptyState("Create two closures to compare independent state.");
    document.querySelector("#closure-timeline").innerHTML = timeline
      .map((t) => `<div class="node">${S.escapeHtml(t)}</div>`)
      .join("");
  }
  function createClosure() {
    const c = {
      id: S.generateId("closure"),
      name: `closure${closures.length + 1}`,
      value: current.value,
    };
    closures.push(c);
    timeline.push(`Create ${c.name}`);
    renderClosureExplorer();
  }
  function invokeClosure(id = closures.at(-1)?.id) {
    const c = closures.find((x) => x.id === id);
    if (!c) return;
    c.value++;
    timeline.push(`Invoke ${c.name}: ${c.value}`);
    renderClosureExplorer();
  }
  function resetClosureScenario() {
    closures = [];
    timeline = [];
    renderClosureExplorer();
  }
  function loadClosureScenario(id) {
    current = scenarios.find((x) => x.id === id) || scenarios[0];
    resetClosureScenario();
  }
  function renderLexicalEnvironment() {
    renderClosureExplorer();
  }
  function renderRetainedVariables() {
    renderClosureExplorer();
  }
  function renderClosureInstances() {
    renderClosureExplorer();
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("closure-explorer");
    scenarios = S.loadWorkspace().closureScenarios;
    const sel = document.querySelector("#closure-scenario");
    sel.innerHTML = scenarios
      .map((x) => `<option value="${x.id}">${S.escapeHtml(x.name)}</option>`)
      .join("");
    loadClosureScenario(scenarios[0].id);
    sel.onchange = (e) => loadClosureScenario(e.target.value);
    document.querySelector("#new-closure").onclick = createClosure;
    document.querySelector("#invoke-closure").onclick = () => invokeClosure();
    document.querySelector("#reset-closures").onclick = resetClosureScenario;
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".closure-select");
      if (b) invokeClosure(b.dataset.id);
    });
  });
  Object.assign(window, {
    renderClosureExplorer,
    createClosure,
    invokeClosure,
    resetClosureScenario,
    loadClosureScenario,
    renderLexicalEnvironment,
    renderRetainedVariables,
    renderClosureInstances,
  });
})();
