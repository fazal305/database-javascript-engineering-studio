(function () {
  "use strict";
  const S = EngineeringStudio;
  let datasets,
    current,
    fields = [],
    grouped = [],
    chart;
  function normalizeAnalyticsRows(data) {
    const rows = Array.isArray(data) ? data : data.rows;
    if (!Array.isArray(rows) || rows.length > 10000)
      throw new Error("Import an array containing no more than 10,000 rows.");
    return rows
      .filter((r) => r && typeof r === "object" && !Array.isArray(r))
      .map((r) => Object.fromEntries(Object.entries(r).slice(0, 100)));
  }
  function inferAnalyticsFields(rows) {
    return [...new Set(rows.flatMap(Object.keys))].map((name) => ({
      name,
      numeric: rows.some(
        (r) =>
          typeof r[name] === "number" || (r[name] !== "" && !isNaN(r[name])),
      ),
    }));
  }
  function renderAnalyticsFieldSelectors() {
    fields = inferAnalyticsFields(current.rows);
    const group = document.querySelector("#group-field"),
      value = document.querySelector("#value-field");
    group.innerHTML = fields
      .map(
        (f) =>
          `<option value="${S.escapeHtml(f.name)}">Group: ${S.escapeHtml(f.name)}</option>`,
      )
      .join("");
    value.innerHTML = fields
      .filter((f) => f.numeric)
      .map(
        (f) =>
          `<option value="${S.escapeHtml(f.name)}">Value: ${S.escapeHtml(f.name)}</option>`,
      )
      .join("");
  }
  function applyAnalyticsFilters() {
    groupAnalyticsRows();
    calculateAggregates();
    renderAnalyticsStats();
    renderAnalyticsCharts();
    renderAnalyticsTable();
  }
  function groupAnalyticsRows() {
    const g = document.querySelector("#group-field").value,
      v = document.querySelector("#value-field").value,
      agg = document.querySelector("#aggregate").value,
      map = {};
    current.rows.forEach((r) =>
      (map[r[g] ?? "(blank)"] ??= []).push(Number(r[v]) || 0),
    );
    grouped = Object.entries(map).map(([group, vals]) => ({
      group,
      value: aggregate(vals, agg),
      count: vals.length,
    }));
    return grouped;
  }
  function aggregate(vals, type) {
    if (type === "count") return vals.length;
    if (type === "average")
      return vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
    if (type === "min") return Math.min(...vals);
    if (type === "max") return Math.max(...vals);
    return vals.reduce((a, b) => a + b, 0);
  }
  function calculateAggregates() {
    return grouped;
  }
  function renderAnalyticsStats() {
    const total = grouped.reduce((a, b) => a + b.value, 0),
      max = Math.max(0, ...grouped.map((x) => x.value));
    document.querySelector("#analytics-stats").innerHTML = [
      [current.rows.length, "Source rows"],
      [grouped.length, "Groups"],
      [total.toFixed(1), "Aggregate total"],
      [max.toFixed(1), "Largest group"],
    ]
      .map(
        (x) =>
          `<div class="panel"><div class="stat-value">${x[0]}</div><div class="stat-label">${x[1]}</div></div>`,
      )
      .join("");
  }
  function renderAnalyticsCharts() {
    chart?.destroy();
    chart = new Chart(document.querySelector("#analytics-chart"), {
      type: "bar",
      data: {
        labels: grouped.map((x) => x.group),
        datasets: [
          {
            label: document.querySelector("#aggregate").value,
            data: grouped.map((x) => x.value),
            backgroundColor: S.loadWorkspace().theme.primary,
            borderColor: S.loadWorkspace().theme.secondary,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: S.loadWorkspace().theme.text } },
        },
        scales: {
          x: { ticks: { color: S.loadWorkspace().theme.muted } },
          y: { ticks: { color: S.loadWorkspace().theme.muted } },
        },
      },
    });
  }
  function table(rows) {
    if (!rows.length) return S.renderEmptyState("No rows available.");
    const cols = Object.keys(rows[0]);
    return `<div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th>${S.escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${rows
      .slice(0, 100)
      .map(
        (r) =>
          `<tr>${cols.map((c) => `<td>${S.escapeHtml(r[c])}</td>`).join("")}</tr>`,
      )
      .join("")}</tbody></table></div>`;
  }
  function renderAnalyticsTable() {
    document.querySelector("#analytics-table").innerHTML = table(grouped);
    document.querySelector("#source-table").innerHTML = table(current.rows);
  }
  function csv(rows) {
    if (!rows.length) return "";
    const cols = Object.keys(rows[0]),
      cell = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    return [
      cols.map(cell).join(","),
      ...rows.map((r) => cols.map((c) => cell(r[c])).join(",")),
    ].join("\n");
  }
  function exportAnalyticsCsv() {
    S.downloadText("analytics-report.csv", csv(grouped), "text/csv");
  }
  function exportAnalyticsJson() {
    S.downloadJson("analytics-report.json", grouped);
  }
  function saveAnalyticsReport() {
    S.addActivityLog("SQL Analytics Studio", "Saved report", current.name);
  }
  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/),
      heads = lines
        .shift()
        .split(",")
        .map((x) => x.replace(/^"|"$/g, ""));
    return lines.map((line) =>
      Object.fromEntries(
        line
          .split(",")
          .map((v, i) => [
            heads[i],
            isNaN(v) ? v.replace(/^"|"$/g, "") : Number(v),
          ]),
      ),
    );
  }
  async function importAnalyticsDataset(event) {
    try {
      const file = event.target.files[0],
        text = await S.readTextFile(file),
        rows = normalizeAnalyticsRows(
          file.name.endsWith(".json") ? S.parseJson(text) : parseCsv(text),
        );
      current = { id: S.generateId("dataset"), name: file.name, rows };
      datasets.push(current);
      renderDatasetSelect();
      renderAnalyticsFieldSelectors();
      applyAnalyticsFilters();
    } catch (e) {
      S.showStatus(e.message, "error");
    }
  }
  function renderDatasetSelect() {
    const el = document.querySelector("#dataset");
    el.innerHTML = datasets
      .map((d) => `<option value="${d.id}">${S.escapeHtml(d.name)}</option>`)
      .join("");
    el.value = current.id;
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("sql-analytics");
    datasets = S.loadWorkspace().analyticsDatasets;
    current = datasets[0];
    renderDatasetSelect();
    renderAnalyticsFieldSelectors();
    applyAnalyticsFilters();
    document.querySelector("#dataset").onchange = (e) => {
      current = datasets.find((d) => d.id === e.target.value);
      renderAnalyticsFieldSelectors();
      applyAnalyticsFilters();
    };
    document.querySelector("#apply-analytics").onclick = applyAnalyticsFilters;
    document.querySelector("#analytics-import").onchange =
      importAnalyticsDataset;
    document.querySelector("#export-csv").onclick = exportAnalyticsCsv;
    document.querySelector("#export-json").onclick = exportAnalyticsJson;
  });
  Object.assign(window, {
    importAnalyticsDataset,
    normalizeAnalyticsRows,
    inferAnalyticsFields,
    renderAnalyticsFieldSelectors,
    applyAnalyticsFilters,
    groupAnalyticsRows,
    calculateAggregates,
    renderAnalyticsStats,
    renderAnalyticsCharts,
    renderAnalyticsTable,
    exportAnalyticsCsv,
    exportAnalyticsJson,
    saveAnalyticsReport,
  });
})();
