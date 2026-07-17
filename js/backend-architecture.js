(function () {
  "use strict";
  const S = EngineeringStudio;
  const layerNames = [
    "Browser / client",
    "HTTP request",
    "Express router",
    "Authentication middleware",
    "Controller",
    "Validation",
    "Service",
    "Repository",
    "Database",
    "Serialization",
    "HTTP response",
    "Browser rendering",
  ];
  let scenarios,
    current,
    steps = [],
    index = -1,
    timer;
  function loadBackendScenario(id) {
    current = scenarios.find((x) => x.id === id) || scenarios[0];
    steps = buildBackendSteps(current);
    resetArchitectureFlow();
  }
  function buildBackendSteps(scenario) {
    let stop = layerNames.length - 1;
    if (scenario.outcome === "validation-error") stop = 5;
    if (scenario.outcome === "auth-error") stop = 3;
    if (scenario.outcome === "database-error") stop = 8;
    return layerNames
      .slice(0, stop + 1)
      .map((name, i) => ({
        id: i,
        name,
        status: i === stop && scenario.outcome !== "success" ? "error" : "ok",
        request: {
          method: /create/i.test(scenario.name) ? "POST" : "GET",
          path: /product/i.test(scenario.name)
            ? "/api/products/42"
            : "/api/users",
          step: name,
          authenticated: scenario.outcome !== "auth-error",
        },
        response:
          i === stop
            ? {
                status:
                  scenario.outcome === "success"
                    ? 200
                    : scenario.outcome === "validation-error"
                      ? 400
                      : scenario.outcome === "auth-error"
                        ? 401
                        : 503,
                body:
                  scenario.outcome === "success"
                    ? { data: "Sample payload" }
                    : { error: scenario.name },
              }
            : null,
      }));
  }
  function renderArchitectureLayers() {
    document.querySelector("#architecture-layers").innerHTML = steps
      .map(
        (s, i) =>
          `<div class="architecture-layer ${i === index ? "active" : ""} ${s.status === "error" ? "error" : ""}"><span class="badge">${i + 1}</span><strong>${S.escapeHtml(s.name)}</strong></div>`,
      )
      .join("");
    const step = steps[index];
    renderRequestInspector(step);
    renderResponseInspector(step);
  }
  function renderRequestInspector(step) {
    document.querySelector("#request-inspector").textContent = step
      ? JSON.stringify(step.request, null, 2)
      : "Step forward to inspect the request packet.";
  }
  function renderResponseInspector(step) {
    document.querySelector("#response-inspector").textContent = step?.response
      ? JSON.stringify(step.response, null, 2)
      : "The response is produced at the terminal step.";
  }
  function stepArchitectureForward() {
    index = Math.min(steps.length - 1, index + 1);
    renderArchitectureLayers();
  }
  function stepArchitectureBackward() {
    index = Math.max(-1, index - 1);
    renderArchitectureLayers();
  }
  function playArchitectureFlow() {
    clearInterval(timer);
    timer = setInterval(
      () => {
        if (index >= steps.length - 1) pauseArchitectureFlow();
        else stepArchitectureForward();
      },
      S.shouldUseReducedMotion()
        ? 20
        : S.loadWorkspace().settings.animationSpeedMs,
    );
  }
  function pauseArchitectureFlow() {
    clearInterval(timer);
  }
  function resetArchitectureFlow() {
    pauseArchitectureFlow();
    index = -1;
    renderArchitectureLayers();
  }
  function exportArchitectureScenario() {
    S.downloadJson(`${S.slugify(current.name)}.json`, {
      scenario: current,
      layers: steps,
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("backend-architecture");
    scenarios = S.loadWorkspace().backendScenarios;
    const sel = document.querySelector("#backend-scenario");
    sel.innerHTML = scenarios
      .map((x) => `<option value="${x.id}">${S.escapeHtml(x.name)}</option>`)
      .join("");
    loadBackendScenario(scenarios[0].id);
    sel.onchange = (e) => loadBackendScenario(e.target.value);
    document.querySelector("#architecture-next").onclick =
      stepArchitectureForward;
    document.querySelector("#architecture-back").onclick =
      stepArchitectureBackward;
    document.querySelector("#architecture-play").onclick = playArchitectureFlow;
    document.querySelector("#architecture-reset").onclick =
      resetArchitectureFlow;
    document.querySelector("#architecture-export").onclick =
      exportArchitectureScenario;
  });
  Object.assign(window, {
    loadBackendScenario,
    buildBackendSteps,
    renderArchitectureLayers,
    renderRequestInspector,
    renderResponseInspector,
    stepArchitectureForward,
    stepArchitectureBackward,
    playArchitectureFlow,
    pauseArchitectureFlow,
    resetArchitectureFlow,
    exportArchitectureScenario,
  });
})();
