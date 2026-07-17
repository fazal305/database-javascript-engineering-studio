(function () {
  "use strict";
  const S = EngineeringStudio;
  let scenarios,
    current,
    index = -1,
    timer;
  function makeState(step) {
    const lower = step.toLowerCase();
    return {
      stack:
        lower.includes("push") ||
        lower.includes("run") ||
        lower.includes("enter")
          ? [step]
          : [],
      apis:
        lower.includes("schedule") || lower.includes("request") ? [step] : [],
      micro:
        lower.includes("promise") ||
        lower.includes("microtask") ||
        lower.includes("resume")
          ? [step]
          : [],
      callbacks:
        lower.includes("timer") || lower.includes("event") ? [step] : [],
    };
  }
  function render() {
    const steps = current.steps;
    document.querySelector("#exec-timeline").innerHTML = steps
      .map(
        (s, i) =>
          `<div class="node ${i === index ? "active" : ""}">${S.escapeHtml(s)}</div>`,
      )
      .join("");
    const state =
      index >= 0
        ? makeState(steps[index])
        : { stack: [], apis: [], micro: [], callbacks: [] };
    [
      ["call-stack", state.stack],
      ["web-apis", state.apis],
      ["microtasks", state.micro],
      ["callbacks", state.callbacks],
    ].forEach(
      ([id, list]) =>
        (document.querySelector(`#${id}`).innerHTML = list
          .map((x) => `<div class="runtime-item">${S.escapeHtml(x)}</div>`)
          .join("")),
    );
    document.querySelector("#exec-explanation").textContent =
      index < 0
        ? "Start stepping to follow the runtime."
        : `Step ${index + 1}: ${steps[index]}. Microtasks drain before the next callback task.`;
  }
  function loadExecutionScenario(id) {
    current = scenarios.find((x) => x.id === id) || scenarios[0];
    resetExecution();
  }
  function stepExecutionForward() {
    index = Math.min(current.steps.length - 1, index + 1);
    render();
  }
  function stepExecutionBackward() {
    index = Math.max(-1, index - 1);
    render();
  }
  function playExecution() {
    clearInterval(timer);
    timer = setInterval(
      () => {
        if (index >= current.steps.length - 1) pauseExecution();
        else stepExecutionForward();
      },
      S.shouldUseReducedMotion()
        ? 20
        : S.loadWorkspace().settings.animationSpeedMs,
    );
  }
  function pauseExecution() {
    clearInterval(timer);
  }
  function resetExecution() {
    pauseExecution();
    index = -1;
    render();
  }
  function renderCallStack() {
    render();
  }
  function renderWebApis() {
    render();
  }
  function renderMicrotaskQueue() {
    render();
  }
  function renderCallbackQueue() {
    render();
  }
  function renderEventLoop() {
    render();
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("javascript-execution-visualizer");
    scenarios = S.loadWorkspace().executionScenarios;
    const select = document.querySelector("#scenario");
    select.innerHTML = scenarios
      .map((x) => `<option value="${x.id}">${S.escapeHtml(x.name)}</option>`)
      .join("");
    loadExecutionScenario(scenarios[0].id);
    select.onchange = (e) => loadExecutionScenario(e.target.value);
    document.querySelector("#exec-next").onclick = stepExecutionForward;
    document.querySelector("#exec-back").onclick = stepExecutionBackward;
    document.querySelector("#exec-play").onclick = playExecution;
    document.querySelector("#exec-reset").onclick = resetExecution;
  });
  Object.assign(window, {
    loadExecutionScenario,
    stepExecutionForward,
    stepExecutionBackward,
    playExecution,
    pauseExecution,
    resetExecution,
    renderCallStack,
    renderWebApis,
    renderMicrotaskQueue,
    renderCallbackQueue,
    renderEventLoop,
  });
})();
