(function () {
  "use strict";
  const S = EngineeringStudio;
  let workspace,
    schema,
    zoom = 1,
    drag = null;
  function persist(action) {
    S.saveWorkspace(workspace);
    S.addActivityLog("Database Designer", action, schema.name);
  }
  function renderDesignerCanvas() {
    const layer = document.querySelector("#table-layer");
    layer.innerHTML = schema.tables
      .map(
        (t) =>
          `<article class="er-table" data-id="${t.id}" style="transform:translate(${t.x}px,${t.y}px) scale(${zoom})"><div class="er-table-header" tabindex="0">${S.escapeHtml(t.name)} <button class="btn btn-small edit-table" data-id="${t.id}">Edit</button></div>${t.columns.map((c) => `<div class="er-column"><span>${c.primaryKey ? "🔑 " : c.foreignKey ? "↗ " : ""}${S.escapeHtml(c.name)}</span><span>${S.escapeHtml(c.type)}</span></div>`).join("")}</article>`,
      )
      .join("");
    drawRelationships();
  }
  function createTable() {
    const name = prompt("Table name", "new_table");
    if (!name) return;
    schema.tables.push({
      id: S.generateId("table"),
      name: S.slugify(name).replaceAll("-", "_"),
      x: 120 + schema.tables.length * 35,
      y: 120 + schema.tables.length * 30,
      columns: [
        {
          id: S.generateId("column"),
          name: "id",
          type: "INT",
          primaryKey: true,
          foreignKey: false,
          nullable: false,
          unique: true,
          defaultValue: "",
        },
      ],
    });
    renderDesignerCanvas();
    persist("Created table");
  }
  function editTable(id) {
    const table = schema.tables.find((t) => t.id === id);
    const name = prompt("Rename table", table.name);
    if (name) table.name = S.slugify(name).replaceAll("-", "_");
    const add = confirm("Add a column to this table?");
    if (add) addColumn(id);
    else {
      renderDesignerCanvas();
      persist("Edited table");
    }
  }
  function deleteTable(id) {
    if (!confirm("Delete this table and its relationships?")) return;
    schema.tables = schema.tables.filter((t) => t.id !== id);
    schema.relationships = schema.relationships.filter(
      (r) => r.sourceTableId !== id && r.targetTableId !== id,
    );
    renderDesignerCanvas();
    persist("Deleted table");
  }
  function addColumn(tableId) {
    const table = schema.tables.find((t) => t.id === tableId),
      name = prompt("Column name", "new_column");
    if (!name) return;
    const type = prompt("SQL data type", "VARCHAR(120)") || "VARCHAR(120)";
    table.columns.push({
      id: S.generateId("column"),
      name: S.slugify(name).replaceAll("-", "_"),
      type: validateType(type),
      primaryKey: false,
      foreignKey: false,
      nullable: true,
      unique: false,
      defaultValue: "",
    });
    renderDesignerCanvas();
    persist("Added column");
  }
  function editColumn(tableId, columnId) {
    const c = schema.tables
      .find((t) => t.id === tableId)
      ?.columns.find((x) => x.id === columnId);
    if (!c) return;
    c.name = prompt("Column name", c.name) || c.name;
    c.type = validateType(prompt("Data type", c.type) || c.type);
    renderDesignerCanvas();
    persist("Edited column");
  }
  function deleteColumn(tableId, columnId) {
    const t = schema.tables.find((x) => x.id === tableId);
    t.columns = t.columns.filter((c) => c.id !== columnId);
    renderDesignerCanvas();
    persist("Deleted column");
  }
  function validateType(type) {
    return /^(INT|BIGINT|VARCHAR\(\d+\)|TEXT|DATE|DATETIME|BOOLEAN|DECIMAL\(\d+,\d+\))$/i.test(
      type.trim(),
    )
      ? type.toUpperCase()
      : "VARCHAR(120)";
  }
  function startTableDrag(event, tableId) {
    if (event.target.closest("button")) return;
    const t = schema.tables.find((x) => x.id === tableId);
    drag = { id: tableId, dx: event.clientX - t.x, dy: event.clientY - t.y };
    event.target.setPointerCapture?.(event.pointerId);
  }
  function moveTable(tableId, x, y) {
    const t = schema.tables.find((v) => v.id === tableId),
      snap = workspace.settings.snapDistance;
    t.x = Math.max(0, Math.round(x / snap) * snap);
    t.y = Math.max(0, Math.round(y / snap) * snap);
    renderDesignerCanvas();
  }
  function createRelationship() {
    if (schema.tables.length < 2)
      return S.showStatus("Create at least two tables first.", "warning");
    const source = prompt(
      `Source table: ${schema.tables.map((t) => t.name).join(", ")}`,
      schema.tables[0].name,
    );
    const target = prompt("Target table", schema.tables[1].name);
    const a = schema.tables.find((t) => t.name === source),
      b = schema.tables.find((t) => t.name === target);
    if (!a || !b || a === b)
      return S.showStatus("Choose two valid, different tables.", "error");
    schema.relationships.push({
      id: S.generateId("relationship"),
      sourceTableId: a.id,
      sourceColumnId: a.columns[0]?.id || "",
      targetTableId: b.id,
      targetColumnId: b.columns[0]?.id || "",
      cardinality: "one-to-many",
      label: prompt("Relationship label", "references") || "references",
    });
    drawRelationships();
    persist("Created relationship");
  }
  function deleteRelationship(id) {
    schema.relationships = schema.relationships.filter((r) => r.id !== id);
    renderDesignerCanvas();
    persist("Deleted relationship");
  }
  function drawRelationships() {
    const svg = document.querySelector("#relationship-layer");
    svg.innerHTML = schema.relationships
      .map((r) => {
        const a = schema.tables.find((t) => t.id === r.sourceTableId),
          b = schema.tables.find((t) => t.id === r.targetTableId);
        if (!a || !b) return "";
        const x1 = a.x + 240,
          y1 = a.y + 40,
          x2 = b.x,
          y2 = b.y + 40,
          m = (x1 + x2) / 2;
        return `<path class="relationship-line" d="M${x1} ${y1} C${m} ${y1},${m} ${y2},${x2} ${y2}"/><text class="relationship-label" x="${m}" y="${(y1 + y2) / 2 - 5}">${S.escapeHtml(r.cardinality)} · ${S.escapeHtml(r.label)}</text>`;
      })
      .join("");
  }
  function zoomCanvas(direction) {
    zoom = S.clamp(zoom + (direction > 0 ? 0.1 : -0.1), 0.5, 1.8);
    renderDesignerCanvas();
  }
  function panCanvas(dx, dy) {
    schema.tables.forEach((t) => {
      t.x += dx;
      t.y += dy;
    });
    renderDesignerCanvas();
  }
  function exportCreateTableSql() {
    const sql = schema.tables
      .map(
        (t) =>
          `CREATE TABLE ${t.name} (\n${t.columns.map((c) => `  ${c.name} ${c.type}${c.nullable ? "" : " NOT NULL"}${c.unique ? " UNIQUE" : ""}${c.primaryKey ? " PRIMARY KEY" : ""}${c.defaultValue ? ` DEFAULT '${c.defaultValue}'` : ""}`).join(",\n")}\n);`,
      )
      .join("\n\n");
    S.downloadText(`${S.slugify(schema.name)}.sql`, sql, "text/sql");
  }
  function parseImportedSql(text) {
    const matches = [
      ...text.matchAll(/CREATE\s+TABLE\s+(\w+)\s*\(([^;]+)\)/gi),
    ];
    if (!matches.length)
      throw new Error("No supported CREATE TABLE statements found.");
    matches.forEach((m, i) =>
      schema.tables.push({
        id: S.generateId("table"),
        name: m[1],
        x: 70 + i * 270,
        y: 80 + (i % 2) * 260,
        columns: m[2].split(",").map((line) => {
          const p = line.trim().split(/\s+/);
          return {
            id: S.generateId("column"),
            name: p[0],
            type: validateType(p[1] || "TEXT"),
            primaryKey: /PRIMARY\s+KEY/i.test(line),
            foreignKey: false,
            nullable: !/NOT\s+NULL/i.test(line),
            unique: /UNIQUE/i.test(line),
            defaultValue: "",
          };
        }),
      }),
    );
    renderDesignerCanvas();
    persist("Imported SQL");
  }
  function exportSchemaJson() {
    S.downloadJson(`${S.slugify(schema.name)}.json`, schema);
  }
  async function importSchemaJson(event) {
    try {
      const data = S.parseJson(await S.readTextFile(event.target.files[0]));
      if (!Array.isArray(data.tables) || data.tables.length > 200)
        throw new Error("Schema must contain fewer than 200 tables.");
      workspace.databaseSchemas[0] = data;
      schema = data;
      renderDesignerCanvas();
      persist("Imported JSON");
    } catch (e) {
      S.showStatus(e.message, "error");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("database-designer");
    workspace = S.loadWorkspace();
    schema = workspace.databaseSchemas[0];
    zoom = workspace.settings.defaultZoom;
    renderDesignerCanvas();
    document.querySelector("#add-table").onclick = createTable;
    document.querySelector("#add-relationship").onclick = createRelationship;
    document.querySelector("#zoom-in").onclick = () => zoomCanvas(1);
    document.querySelector("#zoom-out").onclick = () => zoomCanvas(-1);
    document.querySelector("#export-schema-sql").onclick = exportCreateTableSql;
    document.querySelector("#export-schema-json").onclick = exportSchemaJson;
    document.querySelector("#import-schema-json").onchange = importSchemaJson;
    document.querySelector("#import-schema-sql").onchange = async (e) => {
      try {
        parseImportedSql(await S.readTextFile(e.target.files[0]));
      } catch (err) {
        S.showStatus(err.message, "error");
      }
    };
    document
      .querySelector("#table-layer")
      .addEventListener("pointerdown", (e) => {
        const el = e.target.closest(".er-table");
        if (el) startTableDrag(e, el.dataset.id);
      });
    document.addEventListener("pointermove", (e) => {
      if (drag) moveTable(drag.id, e.clientX - drag.dx, e.clientY - drag.dy);
    });
    document.addEventListener("pointerup", () => {
      if (drag) {
        drag = null;
        persist("Moved table");
      }
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".edit-table");
      if (b) editTable(b.dataset.id);
    });
    document.querySelector("#table-layer").addEventListener("dblclick", (e) => {
      const el = e.target.closest(".er-table");
      if (el) addColumn(el.dataset.id);
    });
  });
  Object.assign(window, {
    renderDesignerCanvas,
    createTable,
    editTable,
    deleteTable,
    addColumn,
    editColumn,
    deleteColumn,
    startTableDrag,
    moveTable,
    createRelationship,
    deleteRelationship,
    drawRelationships,
    zoomCanvas,
    panCanvas,
    exportCreateTableSql,
    parseImportedSql,
    exportSchemaJson,
    importSchemaJson,
  });
})();
