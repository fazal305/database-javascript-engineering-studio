(function () {
  "use strict";
  const S = EngineeringStudio;
  let plan = [],
    index = -1,
    timer,
    speed = 700;
  function parseVisualizerQuery() {
    return new S.SqlParser().parse(
      document.querySelector("#visualizer-sql").value,
    );
  }
  function buildExecutionPlan(ast) {
    const steps = [
      {
        type: "source",
        title: `FROM ${ast.from}`,
        operation: "Read source rows",
        count: 4,
      },
    ];
    ast.joins.forEach((j) =>
      steps.push({
        type: "join",
        title: `${j.type} JOIN ${j.table}`,
        operation: j.on,
        count: 6,
      }),
    );
    if (ast.where.length)
      steps.push({
        type: "filter",
        title: "WHERE filter",
        operation: ast.where.join(" "),
        count: 3,
      });
    if (ast.groupBy.length)
      steps.push({
        type: "group",
        title: "GROUP BY",
        operation: ast.groupBy.join(", "),
        count: 2,
      });
    if (ast.columns.some((c) => /COUNT|SUM|AVG|MIN|MAX/i.test(c)))
      steps.push({
        type: "aggregate",
        title: "Aggregate",
        operation: "Calculate aggregate expressions",
        count: 2,
      });
    if (ast.having.length)
      steps.push({
        type: "having",
        title: "HAVING",
        operation: ast.having.join(" "),
        count: 1,
      });
    if (ast.orderBy.length)
      steps.push({
        type: "sort",
        title: "ORDER BY",
        operation: ast.orderBy.join(", "),
        count: 3,
      });
    if (ast.limit !== null)
      steps.push({
        type: "limit",
        title: `LIMIT ${ast.limit}`,
        operation: "Keep requested row count",
        count: ast.limit,
      });
    steps.push(
      {
        type: "projection",
        title: "Projection",
        operation: ast.columns.join(", "),
        count: steps.at(-1).count,
      },
      {
        type: "result",
        title: "Final result",
        operation: "Return rows to the client",
        count: steps.at(-1).count,
      },
    );
    return steps;
  }
  function renderExecutionPlan(value = plan) {
    document.querySelector("#execution-plan").innerHTML = value
      .map(
        (s, i) =>
          `<div class="node plan-node ${i === index ? "active" : ""}"><span class="badge">${S.escapeHtml(s.type)}</span><strong>${S.escapeHtml(s.title)}</strong><small>${s.count} rows</small></div>`,
      )
      .join("");
    if (index >= 0) {
      const step = value[index];
      document.querySelector("#step-explanation").innerHTML =
        `<h3>${S.escapeHtml(step.title)}</h3><p>${S.escapeHtml(step.operation)}</p><div class="step-metrics"><div class="list-item">Input: ${index ? value[index - 1].count : step.count}</div><div class="list-item">Output: ${step.count}</div></div>`;
      renderIntermediateRows(step);
    }
  }
  function animateExecutionPlan() {
    clearInterval(timer);
    timer = setInterval(
      () => {
        if (index >= plan.length - 1) clearInterval(timer);
        else stepForward();
      },
      S.shouldUseReducedMotion() ? 20 : speed,
    );
  }
  function stepForward() {
    index = Math.min(plan.length - 1, index + 1);
    renderExecutionPlan();
  }
  function stepBackward() {
    index = Math.max(-1, index - 1);
    renderExecutionPlan();
  }
  function resetVisualization() {
    clearInterval(timer);
    index = -1;
    renderExecutionPlan();
    document.querySelector("#step-explanation").innerHTML = S.renderEmptyState(
      "Build a plan, then step through it.",
    );
    document.querySelector("#intermediate-rows").innerHTML = "";
  }
  function renderIntermediateRows(step) {
    const rows = Array.from({ length: Math.min(step.count, 6) }, (_, i) => ({
      row: i + 1,
      state: step.type,
      value: `sample-${i + 1}`,
    }));
    document.querySelector("#intermediate-rows").innerHTML =
      `<div class="table-wrap"><table><thead><tr><th>Row</th><th>Stage</th><th>Value</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.row}</td><td>${r.state}</td><td>${r.value}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function setAnimationSpeed(value) {
    speed = Number(value);
  }
  function build() {
    try {
      plan = buildExecutionPlan(parseVisualizerQuery());
      index = -1;
      renderExecutionPlan();
      S.addActivityLog(
        "SQL Query Visualizer",
        "Built plan",
        `${plan.length} steps`,
      );
    } catch (e) {
      S.showStatus(e.message, "error");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("sql-query-visualizer");
    document.querySelector("#visualizer-sql").value =
      "SELECT employees.name, departments.name FROM employees INNER JOIN departments ON employees.department_id = departments.id WHERE employees.status = 'active' ORDER BY employees.name LIMIT 3;";
    document.querySelector("#build-plan").onclick = build;
    document.querySelector("#step-next").onclick = stepForward;
    document.querySelector("#step-back").onclick = stepBackward;
    document.querySelector("#play-plan").onclick = animateExecutionPlan;
    document.querySelector("#reset-plan").onclick = resetVisualization;
    document.querySelector("#plan-speed").oninput = (e) =>
      setAnimationSpeed(e.target.value);
    build();
  });
  Object.assign(window, {
    parseVisualizerQuery,
    buildExecutionPlan,
    renderExecutionPlan,
    animateExecutionPlan,
    stepForward,
    stepBackward,
    resetVisualization,
    renderIntermediateRows,
    setAnimationSpeed,
  });
})();
