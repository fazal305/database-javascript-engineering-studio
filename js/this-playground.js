(function () {
  "use strict";
  const S = EngineeringStudio;
  let scenarios, current;
  const code = {
    "Regular function": "function show() { return this; }\nshow();",
    "Object method":
      "const user = { name: 'Amina', show() { return this.name; } };\nuser.show();",
    "Arrow function": "const user = { show: () => this };\nuser.show();",
    Constructor:
      "function User(name) { this.name = name; }\nnew User('Amina');",
    "call()": "show.call({ name: 'Amina' });",
    "apply()": "show.apply({ name: 'Amina' }, []);",
    "bind()": "const bound = show.bind({ name: 'Amina' });\nbound();",
  };
  function loadThisScenario(id) {
    current = scenarios.find((x) => x.id === id) || scenarios[0];
    renderThisScenario();
  }
  function determineThisBinding(scenario) {
    if (scenario.name === "Object method")
      return {
        result: "user object",
        path: ["Invocation", "Member call", "Receiver object"],
      };
    if (scenario.name === "Arrow function")
      return {
        result: "lexical this",
        path: ["Arrow function", "No own binding", "Enclosing scope"],
      };
    if (scenario.name === "Constructor")
      return {
        result: "new instance",
        path: ["new", "Create object", "Bind instance"],
      };
    if (/call|apply|bind/.test(scenario.name))
      return {
        result: "explicit object",
        path: [scenario.name, "Explicit binding", "Provided object"],
      };
    return {
      result: "undefined in strict mode",
      path: ["Plain call", "Strict mode", "undefined"],
    };
  }
  function renderThisScenario() {
    document.querySelector("#this-code").textContent = code[current.name];
    document.querySelector("#this-result").textContent =
      "Run the scenario to resolve the binding.";
    document.querySelector("#this-path").innerHTML = "";
  }
  function runThisScenario() {
    const r = determineThisBinding(current);
    document.querySelector("#this-result").innerHTML =
      `<strong>this → ${S.escapeHtml(r.result)}</strong><p class="help">${S.escapeHtml(current.rule)}</p>`;
    document.querySelector("#this-path").innerHTML = r.path
      .map((x) => `<div class="node">${S.escapeHtml(x)}</div>`)
      .join("");
  }
  function renderInvocationDiagram() {
    runThisScenario();
  }
  function renderBindingExplanation() {
    runThisScenario();
  }
  function compareThisRules() {
    document.querySelector("#this-rules").innerHTML =
      `<table><thead><tr><th>Scenario</th><th>Binding rule</th></tr></thead><tbody>${scenarios.map((x) => `<tr><td>${S.escapeHtml(x.name)}</td><td>${S.escapeHtml(x.rule)}</td></tr>`).join("")}</tbody></table>`;
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("this-playground");
    scenarios = S.loadWorkspace().thisScenarios;
    const sel = document.querySelector("#this-scenario");
    sel.innerHTML = scenarios
      .map((x) => `<option value="${x.id}">${S.escapeHtml(x.name)}</option>`)
      .join("");
    loadThisScenario(scenarios[0].id);
    compareThisRules();
    sel.onchange = (e) => loadThisScenario(e.target.value);
    document.querySelector("#run-this").onclick = runThisScenario;
  });
  Object.assign(window, {
    loadThisScenario,
    determineThisBinding,
    renderInvocationDiagram,
    renderBindingExplanation,
    compareThisRules,
  });
})();
