(function () {
  "use strict";
  const S = window.EngineeringStudio;
  let modules = S.moduleConfig.filter(
    (m) => !["dashboard", "settings"].includes(m.id),
  );
  function renderDashboardHero() {
    const w = S.loadWorkspace();
    document.querySelector("#hero-title").textContent = w.brand.name;
    document.querySelector("#hero-tagline").textContent = w.brand.tagline;
  }
  function renderDashboardStats() {
    const w = S.loadWorkspace();
    const values = [
      [w.databaseSchemas.length, "Schemas"],
      [w.savedQueries.length, "Saved queries"],
      [w.sqlHistory.length, "Simulations"],
      [modules.length, "Learning modules"],
    ];
    document.querySelector("#stats").innerHTML = values
      .map(
        ([v, l]) =>
          `<div class="panel"><div class="stat-value">${S.formatNumber(v)}</div><div class="stat-label">${S.escapeHtml(l)}</div></div>`,
      )
      .join("");
  }
  function renderDashboardModules(list = modules) {
    S.renderModuleCards("#module-grid", list);
  }
  function renderLearningProgression() {
    const steps = [
      "SQL",
      "Schemas",
      "Relationships",
      "Query execution",
      "Analytics",
      "Objects",
      "Closures",
      "Execution context",
      "Event loop",
      "Memory",
      "Backend architecture",
    ];
    document.querySelector("#progression").innerHTML = steps
      .map((s) => `<span>${S.escapeHtml(s)}</span>`)
      .join("");
  }
  function renderRecentActivity() {
    const rows = S.loadWorkspace().activityLog.slice(0, 8);
    document.querySelector("#activity").innerHTML = rows
      .map(
        (a) =>
          `<div class="list-item"><strong>${S.escapeHtml(a.action)}</strong> · ${S.escapeHtml(a.module)}<div class="help">${S.formatTimestamp(a.createdAt)}</div></div>`,
      )
      .join("");
  }
  function filterDashboardModules(value) {
    const q = value.trim().toLowerCase();
    renderDashboardModules(
      modules.filter((m) =>
        `${m.title} ${m.description} ${m.category}`.toLowerCase().includes(q),
      ),
    );
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("dashboard");
    renderDashboardHero();
    renderDashboardStats();
    renderDashboardModules();
    renderLearningProgression();
    renderRecentActivity();
    document.querySelector("#module-search").addEventListener(
      "input",
      S.debounce((e) => filterDashboardModules(e.target.value), 180),
    );
  });
  Object.assign(window, {
    renderDashboardHero,
    renderDashboardStats,
    renderDashboardModules,
    renderLearningProgression,
    renderRecentActivity,
    filterDashboardModules,
  });
})();
