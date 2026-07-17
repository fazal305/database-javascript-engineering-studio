(function () {
  "use strict";
  const STORAGE_KEY = "engineeringStudio.workspace.v1";
  const moduleConfig = [
    {
      id: "dashboard",
      title: "Dashboard",
      description: "Workspace overview and guided learning paths.",
      page: "index.html",
      category: "Workspace",
      icon: "HO",
      status: "Active",
    },
    {
      id: "mysql-workbench",
      title: "MySQL Workbench",
      description: "Write, format, save, explain, and simulate SQL queries.",
      page: "mysql-workbench.html",
      category: "Database",
      icon: "SQL",
      status: "Active",
    },
    {
      id: "database-designer",
      title: "Visual Database Designer",
      description:
        "Model tables, columns, keys, and relationships on an ER canvas.",
      page: "database-designer.html",
      category: "Database",
      icon: "ER",
      status: "Active",
    },
    {
      id: "sql-query-visualizer",
      title: "SQL Query Visualizer",
      description:
        "Step through relational query operations and intermediate rows.",
      page: "sql-query-visualizer.html",
      category: "Database",
      icon: "QV",
      status: "Active",
    },
    {
      id: "oop-playground",
      title: "OOP Playground",
      description:
        "Build classes, instances, inheritance, and polymorphic behavior.",
      page: "oop-playground.html",
      category: "JavaScript",
      icon: "OP",
      status: "Active",
    },
    {
      id: "javascript-execution-visualizer",
      title: "JavaScript Execution",
      description: "Explore the call stack, Web APIs, queues, and event loop.",
      page: "javascript-execution-visualizer.html",
      category: "JavaScript",
      icon: "JS",
      status: "Active",
    },
    {
      id: "closure-explorer",
      title: "Closure Explorer",
      description:
        "See lexical environments and independently retained values.",
      page: "closure-explorer.html",
      category: "JavaScript",
      icon: "CL",
      status: "Active",
    },
    {
      id: "this-playground",
      title: "this Playground",
      description:
        "Compare invocation rules for methods, arrows, constructors, call, apply, and bind.",
      page: "this-playground.html",
      category: "JavaScript",
      icon: "TH",
      status: "Active",
    },
    {
      id: "memory-explorer",
      title: "Memory Explorer",
      description:
        "Visualize stack, heap, references, reachability, and garbage candidates.",
      page: "memory-explorer.html",
      category: "JavaScript",
      icon: "ME",
      status: "Active",
    },
    {
      id: "sql-analytics",
      title: "SQL Analytics Studio",
      description:
        "Filter, group, aggregate, chart, and export structured datasets.",
      page: "sql-analytics.html",
      category: "Analytics",
      icon: "AN",
      status: "Active",
    },
    {
      id: "backend-architecture",
      title: "Backend Architecture",
      description: "Simulate layered request and response lifecycles.",
      page: "backend-architecture.html",
      category: "Architecture",
      icon: "BE",
      status: "Active",
    },
    {
      id: "settings",
      title: "Settings",
      description: "Customize theme, motion, layout, and workspace data.",
      page: "settings.html",
      category: "Workspace",
      icon: "SE",
      status: "Active",
    },
  ];
  const demoTables = [
    {
      id: "employees",
      name: "employees",
      x: 80,
      y: 80,
      columns: [
        {
          id: "e1",
          name: "id",
          type: "INT",
          primaryKey: true,
          foreignKey: false,
          nullable: false,
          unique: true,
          defaultValue: "",
        },
        {
          id: "e2",
          name: "name",
          type: "VARCHAR(120)",
          primaryKey: false,
          foreignKey: false,
          nullable: false,
          unique: false,
          defaultValue: "",
        },
        {
          id: "e3",
          name: "department_id",
          type: "INT",
          primaryKey: false,
          foreignKey: true,
          nullable: false,
          unique: false,
          defaultValue: "",
        },
        {
          id: "e4",
          name: "status",
          type: "VARCHAR(20)",
          primaryKey: false,
          foreignKey: false,
          nullable: false,
          unique: false,
          defaultValue: "active",
        },
      ],
      rows: [
        {
          id: 1,
          name: "Amina Khan",
          department_id: 1,
          status: "active",
          salary: 92000,
        },
        {
          id: 2,
          name: "Jon Bell",
          department_id: 2,
          status: "active",
          salary: 81000,
        },
        {
          id: 3,
          name: "Mei Chen",
          department_id: 1,
          status: "inactive",
          salary: 88000,
        },
        {
          id: 4,
          name: "Sara Noor",
          department_id: 3,
          status: "active",
          salary: 76000,
        },
      ],
    },
    {
      id: "departments",
      name: "departments",
      x: 520,
      y: 90,
      columns: [
        {
          id: "d1",
          name: "id",
          type: "INT",
          primaryKey: true,
          foreignKey: false,
          nullable: false,
          unique: true,
          defaultValue: "",
        },
        {
          id: "d2",
          name: "name",
          type: "VARCHAR(80)",
          primaryKey: false,
          foreignKey: false,
          nullable: false,
          unique: true,
          defaultValue: "",
        },
      ],
      rows: [
        { id: 1, name: "Engineering" },
        { id: 2, name: "Design" },
        { id: 3, name: "Data" },
      ],
    },
    {
      id: "projects",
      name: "projects",
      x: 300,
      y: 360,
      columns: [
        {
          id: "p1",
          name: "id",
          type: "INT",
          primaryKey: true,
          foreignKey: false,
          nullable: false,
          unique: true,
          defaultValue: "",
        },
        {
          id: "p2",
          name: "name",
          type: "VARCHAR(120)",
          primaryKey: false,
          foreignKey: false,
          nullable: false,
          unique: false,
          defaultValue: "",
        },
        {
          id: "p3",
          name: "budget",
          type: "DECIMAL(12,2)",
          primaryKey: false,
          foreignKey: false,
          nullable: false,
          unique: false,
          defaultValue: "0",
        },
      ],
      rows: [
        { id: 1, name: "Atlas", budget: 120000 },
        { id: 2, name: "Orbit", budget: 85000 },
      ],
    },
  ];
  const sqlSamples = [
    "SELECT * FROM employees;",
    "SELECT name, status FROM employees WHERE status = 'active';",
    "SELECT department_id, COUNT(*) AS employee_count FROM employees GROUP BY department_id;",
    "SELECT employees.name, departments.name FROM employees INNER JOIN departments ON employees.department_id = departments.id;",
    "SELECT * FROM employees ORDER BY name;",
    "SELECT * FROM projects WHERE budget > 90000;",
    "INSERT INTO departments (id, name) VALUES (4, 'Research');",
    "UPDATE employees SET status = 'active' WHERE id = 3;",
  ];
  const defaultWorkspace = {
    brand: {
      name: "Database & JavaScript Engineering Studio",
      shortName: "Engineering Studio",
      tagline:
        "Visualize databases, SQL, JavaScript execution, memory, and backend architecture.",
    },
    settings: {
      compactSidebar: false,
      transitionSpeedMs: 280,
      loaderDelayMs: 200,
      loaderLabel: "Loading workspace",
      loaderSize: 34,
      defaultPageSize: 20,
      animationSpeedMs: 700,
      canvasGridSize: 24,
      snapDistance: 10,
      defaultZoom: 1,
      reducedMotion: false,
      sidebarWidth: 270,
      panelPadding: 20,
    },
    theme: {
      bg: "#050711",
      bgSoft: "#0a1020",
      surface: "rgba(14, 21, 40, 0.92)",
      surfaceStrong: "rgba(18, 29, 56, 0.98)",
      text: "#f4f8ff",
      muted: "#94a3b8",
      primary: "#22d3ee",
      secondary: "#a855f7",
      success: "#4ade80",
      warning: "#facc15",
      danger: "#fb7185",
      info: "#60a5fa",
      border: "rgba(34, 211, 238, 0.24)",
      radius: 18,
      radiusSmall: 10,
      fontFamily: "Inter, sans-serif",
      fontMono: "Cascadia Code, Consolas, monospace",
    },
    databaseSchemas: [],
    sqlHistory: [],
    savedQueries: [],
    sqlSimulations: [],
    oopProjects: [],
    executionScenarios: [],
    closureScenarios: [],
    thisScenarios: [],
    memoryScenarios: [],
    analyticsDatasets: [],
    backendScenarios: [],
    activityLog: [],
  };
  function escapeHtml(value) {
    const el = document.createElement("div");
    el.textContent = String(value ?? "");
    return el.innerHTML;
  }
  function generateId(prefix = "id") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
  function formatTimestamp(value) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }
  function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(value),
    );
  }
  function formatNumber(value) {
    return new Intl.NumberFormat().format(Number(value) || 0);
  }
  function formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    const units = ["KB", "MB", "GB"];
    let v = n / 1024,
      i = 0;
    while (v >= 1024 && i < 2) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(1)} ${units[i]}`;
  }
  function safeClone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function mergeWorkspace(raw) {
    return {
      ...safeClone(defaultWorkspace),
      ...raw,
      brand: { ...defaultWorkspace.brand, ...raw?.brand },
      settings: { ...defaultWorkspace.settings, ...raw?.settings },
      theme: { ...defaultWorkspace.theme, ...raw?.theme },
    };
  }
  function loadWorkspace() {
    try {
      return mergeWorkspace(
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {},
      );
    } catch {
      return safeClone(defaultWorkspace);
    }
  }
  function saveWorkspace(workspace) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    window.dispatchEvent(
      new CustomEvent("studio:workspace", { detail: workspace }),
    );
    return workspace;
  }
  function resetWorkspace() {
    localStorage.removeItem(STORAGE_KEY);
    return seedDemoData(true);
  }
  function seedDemoData(force = false) {
    let w = force ? safeClone(defaultWorkspace) : loadWorkspace();
    if (w.databaseSchemas.length && !force) return w;
    w.databaseSchemas = [
      {
        id: "employee-db",
        name: "Employee Operations",
        tables: safeClone(demoTables),
        relationships: [
          {
            id: "r1",
            sourceTableId: "employees",
            sourceColumnId: "e3",
            targetTableId: "departments",
            targetColumnId: "d1",
            cardinality: "one-to-many",
            label: "belongs to",
          },
        ],
      },
    ];
    w.savedQueries = sqlSamples
      .slice(0, 5)
      .map((sql, i) => ({
        id: `saved-${i}`,
        name: [
          "All employees",
          "Active employees",
          "Team totals",
          "Employee departments",
          "Alphabetical roster",
        ][i],
        sql,
        createdAt: Date.now() - i * 86400000,
      }));
    w.sqlHistory = sqlSamples.map((sql, i) => ({
      id: `history-${i}`,
      sql,
      status: "Simulated",
      createdAt: Date.now() - i * 3600000,
    }));
    w.sqlSimulations = sqlSamples
      .slice(0, 6)
      .map((sql, i) => ({ id: `sim-${i}`, name: `Query plan ${i + 1}`, sql }));
    w.oopProjects = [
      "Employee inheritance",
      "Shape polymorphism",
      "Bank accounts",
      "Vehicles",
      "Notification channels",
    ].map((name, i) => ({ id: `oop-${i}`, name, classes: [] }));
    w.executionScenarios = [
      {
        id: "timers",
        name: "Timers and microtasks",
        steps: [
          "Push global()",
          "Schedule setTimeout",
          "Queue Promise.then",
          "Pop global()",
          "Run Promise microtask",
          "Run timer callback",
        ],
      },
      {
        id: "fetch",
        name: "Fetch response",
        steps: [
          "Start script",
          "Request fetch",
          "Continue synchronous work",
          "Resolve response",
          "Queue promise callback",
          "Run callback",
        ],
      },
      {
        id: "nested",
        name: "Nested promises",
        steps: [
          "Run global",
          "Queue promise A",
          "Run A",
          "Queue promise B",
          "Run B",
        ],
      },
      {
        id: "events",
        name: "DOM event",
        steps: [
          "Register listener",
          "User event enters task queue",
          "Run listener",
        ],
      },
      {
        id: "async",
        name: "async / await",
        steps: [
          "Enter async function",
          "Pause at await",
          "Resume as microtask",
        ],
      },
      {
        id: "mixed",
        name: "Mixed workload",
        steps: [
          "Run script",
          "Queue timer",
          "Queue microtask",
          "Run microtask",
          "Run timer",
        ],
      },
    ];
    w.closureScenarios = [
      "Counter factory",
      "Private balance",
      "Greeting builder",
      "Memoized value",
      "Event handler factory",
    ].map((name, i) => ({
      id: `closure-${i}`,
      name,
      value: i,
      outer: { seed: i },
    }));
    w.thisScenarios = [
      "Regular function",
      "Object method",
      "Arrow function",
      "Constructor",
      "call()",
      "apply()",
      "bind()",
    ].map((name, i) => ({
      id: `this-${i}`,
      name,
      rule: name,
      result:
        i === 1
          ? "receiver object"
          : i === 2
            ? "lexical this"
            : "explicit or call-site binding",
    }));
    w.memoryScenarios = [
      "Shared object",
      "Orphan object",
      "Circular references",
      "Closure retention",
      "Array graph",
      "DOM-style tree",
    ].map((name, i) => ({
      id: `memory-${i}`,
      name,
      nodes: [
        { id: "root", type: "stack", label: "root", references: ["obj"] },
        {
          id: "obj",
          type: "heap",
          label: `Object ${i + 1}`,
          references: i === 2 ? ["root"] : [],
        },
      ],
    }));
    w.analyticsDatasets = [
      {
        id: "sales",
        name: "Quarterly sales",
        rows: [
          { region: "North", quarter: "Q1", revenue: 120000, orders: 54 },
          { region: "South", quarter: "Q1", revenue: 98000, orders: 48 },
          { region: "North", quarter: "Q2", revenue: 145000, orders: 63 },
          { region: "South", quarter: "Q2", revenue: 110000, orders: 51 },
        ],
      },
      { id: "workforce", name: "Workforce", rows: demoTables[0].rows },
      { id: "projects", name: "Project portfolio", rows: demoTables[2].rows },
    ];
    const scenarios = [
      "Get users",
      "Create user",
      "Invalid request",
      "Authentication failure",
      "Database timeout",
      "Successful product request",
    ];
    w.backendScenarios = scenarios.map((name, i) => ({
      id: `backend-${i}`,
      name,
      outcome:
        i === 2
          ? "validation-error"
          : i === 3
            ? "auth-error"
            : i === 4
              ? "database-error"
              : "success",
    }));
    w.activityLog = Array.from({ length: 20 }, (_, i) => ({
      id: `activity-${i}`,
      module: moduleConfig[1 + (i % 10)].title,
      action: [
        "Opened module",
        "Saved scenario",
        "Ran simulation",
        "Exported data",
      ][i % 4],
      detail: `Demo activity ${i + 1}`,
      createdAt: Date.now() - i * 2700000,
    }));
    return saveWorkspace(w);
  }
  function addActivityLog(module, action, detail = "") {
    const w = loadWorkspace();
    w.activityLog.unshift({
      id: generateId("activity"),
      module,
      action,
      detail,
      createdAt: Date.now(),
    });
    w.activityLog = w.activityLog.slice(0, 100);
    saveWorkspace(w);
  }
  function cssName(key) {
    return `--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
  }
  function applyThemeSettings() {
    const w = loadWorkspace();
    Object.entries(w.theme).forEach(([k, v]) =>
      document.documentElement.style.setProperty(
        cssName(k),
        typeof v === "number" ? `${v}px` : v,
      ),
    );
    document.documentElement.style.setProperty(
      "--transition-speed",
      `${w.settings.transitionSpeedMs}ms`,
    );
  }
  function applyLayoutSettings() {
    const w = loadWorkspace();
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${w.settings.sidebarWidth}px`,
    );
    document.documentElement.style.setProperty(
      "--panel-padding",
      `${w.settings.panelPadding}px`,
    );
    document.documentElement.style.setProperty(
      "--grid-size",
      `${w.settings.canvasGridSize}px`,
    );
    document
      .querySelector(".sidebar")
      ?.classList.toggle("compact", w.settings.compactSidebar);
  }
  function renderSidebar(activePage) {
    const host = document.querySelector("[data-sidebar]");
    if (!host) return;
    const w = loadWorkspace();
    const groups = [...new Set(moduleConfig.map((m) => m.category))];
    host.className = "sidebar";
    host.innerHTML = `<a class="brand" href="index.html"><span class="brand-mark">DJS</span><span class="brand-copy"><strong>${escapeHtml(w.brand.shortName)}</strong><small>Learning workspace</small></span></a><nav>${groups
      .map(
        (g) =>
          `<div class="nav-section">${escapeHtml(g)}</div>${moduleConfig
            .filter((m) => m.category === g)
            .map(
              (m) =>
                `<a class="nav-link ${m.id === activePage ? "active" : ""}" href="${m.page}" data-page="${m.id}"><span class="nav-icon">${m.icon}</span><span class="nav-label">${escapeHtml(m.title)}</span></a>`,
            )
            .join("")}`,
      )
      .join("")}</nav>`;
    applyLayoutSettings();
  }
  function renderTopbar(pageConfig) {
    const host = document.querySelector("[data-topbar]");
    if (!host) return;
    const p =
      typeof pageConfig === "string"
        ? moduleConfig.find((m) => m.id === pageConfig)
        : pageConfig;
    host.className = "topbar";
    host.innerHTML = `<div><h1>${escapeHtml(p?.title || "Engineering Studio")}</h1><p>${escapeHtml(p?.description || "")}</p></div><span class="badge">Learning simulator</span>`;
  }
  function setActiveNav() {
    const file = location.pathname.split("/").pop() || "index.html";
    document
      .querySelectorAll(".nav-link")
      .forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === file),
      );
  }
  function renderModuleCards(
    container,
    modules = moduleConfig.filter(
      (m) => !["dashboard", "settings"].includes(m.id),
    ),
  ) {
    const host =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    if (!host) return;
    host.innerHTML = modules
      .map(
        (m) =>
          `<a class="panel module-card" href="${m.page}"><div class="module-icon">${m.icon}</div><span class="badge">${escapeHtml(m.category)}</span><h3>${escapeHtml(m.title)}</h3><p class="muted">${escapeHtml(m.description)}</p><span class="module-link">Launch module →</span></a>`,
      )
      .join("");
  }
  function showStatus(message, type = "info") {
    document.querySelector(".status")?.remove();
    const el = document.createElement("div");
    el.className = `status ${type}`;
    el.setAttribute("role", "status");
    el.textContent = message;
    document.body.append(el);
    setTimeout(() => el.remove(), 3200);
  }
  function renderEmptyState(message) {
    return `<div class="empty">${escapeHtml(message)}</div>`;
  }
  async function copyText(text, message = "Copied to clipboard") {
    await navigator.clipboard.writeText(text);
    showStatus(message, "success");
  }
  function downloadText(filename, text, mimeType = "text/plain") {
    const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadJson(filename, data) {
    downloadText(filename, JSON.stringify(data, null, 2), "application/json");
  }
  function readTextFile(file) {
    if (!file || file.size > 5_000_000)
      return Promise.reject(new Error("Choose a file smaller than 5 MB."));
    return file.text();
  }
  function parseJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("The selected file is not valid JSON.");
    }
  }
  function slugify(value) {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  function shouldUseReducedMotion() {
    return (
      loadWorkspace().settings.reducedMotion ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }
  let loaderTimer;
  function ensureOverlay() {
    let el = document.querySelector(".transition-overlay");
    if (!el) {
      el = document.createElement("div");
      el.className = "transition-overlay";
      el.innerHTML = `<div class="transition-loader"><div class="spinner"></div><span></span></div>`;
      document.body.append(el);
    }
    return el;
  }
  function showTransitionOverlay() {
    const el = ensureOverlay();
    requestAnimationFrame(() => el.classList.add("visible"));
    return el;
  }
  function showTransitionLoader() {
    const w = loadWorkspace(),
      loader = ensureOverlay().querySelector(".transition-loader");
    loader.querySelector("span").textContent = w.settings.loaderLabel;
    loader.querySelector(".spinner").style.width = `${w.settings.loaderSize}px`;
    loader.querySelector(".spinner").style.height =
      `${w.settings.loaderSize}px`;
    loader.classList.add("visible");
  }
  function hideTransitionOverlay() {
    clearTimeout(loaderTimer);
    const el = ensureOverlay();
    el.classList.remove("visible");
    el.querySelector(".transition-loader").classList.remove("visible");
  }
  function navigateWithTransition(url) {
    const w = loadWorkspace();
    showTransitionOverlay();
    loaderTimer = setTimeout(showTransitionLoader, w.settings.loaderDelayMs);
    setTimeout(
      () => {
        location.href = url;
      },
      shouldUseReducedMotion() ? 0 : Math.max(80, w.settings.transitionSpeedMs),
    );
  }
  function initPageTransitions() {
    ensureOverlay();
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (
        !a ||
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        a.target ||
        a.hasAttribute("download")
      )
        return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname)
        return;
      e.preventDefault();
      navigateWithTransition(a.href);
    });
    addEventListener("pageshow", hideTransitionOverlay);
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function debounce(callback, delay = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => callback(...args), delay);
    };
  }
  function getQueryParam(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function initPage(id) {
    if (!localStorage.getItem(STORAGE_KEY)) seedDemoData(true);
    applyThemeSettings();
    renderSidebar(id);
    renderTopbar(id);
    setActiveNav();
    initPageTransitions();
  }
  window.EngineeringStudio = {
    STORAGE_KEY,
    moduleConfig,
    defaultWorkspace,
    escapeHtml,
    generateId,
    formatTimestamp,
    formatDate,
    formatNumber,
    formatBytes,
    safeClone,
    loadWorkspace,
    saveWorkspace,
    resetWorkspace,
    seedDemoData,
    addActivityLog,
    applyThemeSettings,
    applyLayoutSettings,
    renderSidebar,
    renderTopbar,
    setActiveNav,
    renderModuleCards,
    showStatus,
    renderEmptyState,
    copyText,
    downloadText,
    downloadJson,
    readTextFile,
    parseJson,
    slugify,
    initPageTransitions,
    showTransitionOverlay,
    showTransitionLoader,
    hideTransitionOverlay,
    navigateWithTransition,
    shouldUseReducedMotion,
    clamp,
    debounce,
    getQueryParam,
    initPage,
  };
})();
