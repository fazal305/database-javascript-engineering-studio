(function () {
  "use strict";
  const S = window.EngineeringStudio;
  const KEYWORDS = new Set(
    "SELECT FROM WHERE INNER LEFT RIGHT FULL JOIN ON GROUP BY HAVING ORDER ASC DESC LIMIT AS INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP ADD COLUMN AND OR NOT NULL IS COUNT SUM AVG MIN MAX DISTINCT".split(
      " ",
    ),
  );
  class SqlTokenizer {
    tokenize(sql) {
      const tokens = [];
      const re =
        /\s+|--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"|\d+(?:\.\d+)?|[A-Za-z_][\w$]*|<>|!=|<=|>=|[=<>+*/%-]|[,().;]/gy;
      let pos = 0,
        m;
      while (pos < sql.length) {
        re.lastIndex = pos;
        m = re.exec(sql);
        if (!m)
          throw new Error(
            `Unexpected character at position ${pos}: ${sql[pos]}`,
          );
        const value = m[0];
        pos = re.lastIndex;
        if (/^\s|^--|^\/\*/.test(value)) continue;
        let type = "identifier";
        if (KEYWORDS.has(value.toUpperCase())) type = "keyword";
        else if (/^['"]/.test(value)) type = "string";
        else if (/^\d/.test(value)) type = "number";
        else if (/^[,().;]$/.test(value))
          type = {
            ",": "comma",
            "(": "paren",
            ")": "paren",
            ".": "dot",
            ";": "semicolon",
          }[value];
        else if (/^[=<>!+*/%-]/.test(value)) type = "operator";
        tokens.push({ type, value, start: m.index, end: pos });
      }
      return tokens;
    }
  }
  class SqlParser {
    constructor() {
      this.tokenizer = new SqlTokenizer();
    }
    parse(sql) {
      this.tokens = this.tokenizer.tokenize(sql);
      this.i = 0;
      if (!this.tokens.length) throw new Error("Enter a SQL statement.");
      const kind = this.peek().value.toUpperCase();
      if (kind === "SELECT") return this.parseSelect();
      if (
        ["INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP"].includes(kind)
      )
        return {
          type: kind.toLowerCase(),
          tokens: this.tokens,
          table: this.detectMutationTable(kind),
        };
      throw new Error(
        `Unsupported statement ${kind}. This learning parser supports SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, and DROP.`,
      );
    }
    peek(offset = 0) {
      return this.tokens[this.i + offset];
    }
    consume(value) {
      const t = this.peek();
      if (!t || (value && t.value.toUpperCase() !== value))
        throw new Error(
          `Expected ${value || "token"} near token ${this.i + 1}`,
        );
      this.i++;
      return t;
    }
    collectUntil(words) {
      const out = [];
      while (this.peek() && !words.includes(this.peek().value.toUpperCase()))
        out.push(this.consume().value);
      return out;
    }
    parseSelect() {
      this.consume("SELECT");
      const columnTokens = this.collectUntil(["FROM"]);
      this.consume("FROM");
      const from = this.consume().value;
      const ast = {
        type: "select",
        columns: this.splitComma(columnTokens),
        from,
        joins: [],
        where: [],
        groupBy: [],
        having: [],
        orderBy: [],
        limit: null,
      };
      while (this.peek()) {
        const word = this.peek().value.toUpperCase();
        if (["INNER", "LEFT", "RIGHT", "FULL", "JOIN"].includes(word)) {
          let joinType = "INNER";
          if (word !== "JOIN") joinType = this.consume().value.toUpperCase();
          this.consume("JOIN");
          const table = this.consume().value;
          let on = [];
          if (this.peek()?.value.toUpperCase() === "ON") {
            this.consume("ON");
            on = this.collectUntil([
              "INNER",
              "LEFT",
              "RIGHT",
              "FULL",
              "JOIN",
              "WHERE",
              "GROUP",
              "HAVING",
              "ORDER",
              "LIMIT",
              ";",
            ]);
          }
          ast.joins.push({ type: joinType, table, on: on.join(" ") });
        } else if (word === "WHERE") {
          this.consume();
          ast.where = this.collectUntil([
            "GROUP",
            "HAVING",
            "ORDER",
            "LIMIT",
            ";",
          ]);
        } else if (word === "GROUP") {
          this.consume();
          this.consume("BY");
          ast.groupBy = this.splitComma(
            this.collectUntil(["HAVING", "ORDER", "LIMIT", ";"]),
          );
        } else if (word === "HAVING") {
          this.consume();
          ast.having = this.collectUntil(["ORDER", "LIMIT", ";"]);
        } else if (word === "ORDER") {
          this.consume();
          this.consume("BY");
          ast.orderBy = this.splitComma(this.collectUntil(["LIMIT", ";"]));
        } else if (word === "LIMIT") {
          this.consume();
          ast.limit = Number(this.consume().value);
        } else this.i++;
      }
      return ast;
    }
    splitComma(tokens) {
      const out = [];
      let cur = [];
      for (const t of tokens) {
        if (t === ",") {
          out.push(cur.join(" "));
          cur = [];
        } else cur.push(t);
      }
      if (cur.length) out.push(cur.join(" "));
      return out;
    }
    detectMutationTable(kind) {
      const vals = this.tokens.map((t) => t.value);
      const idx =
        kind === "INSERT"
          ? vals.findIndex((v) => v.toUpperCase() === "INTO") + 1
          : kind === "DELETE"
            ? vals.findIndex((v) => v.toUpperCase() === "FROM") + 1
            : 1;
      return vals[idx] || "unknown";
    }
  }
  class SqlFormatter {
    format(sql) {
      const tokens = new SqlTokenizer().tokenize(sql);
      let out = "";
      const breaks = new Set([
        "SELECT",
        "FROM",
        "WHERE",
        "GROUP",
        "HAVING",
        "ORDER",
        "LIMIT",
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATE",
        "ALTER",
        "DROP",
        "INNER",
        "LEFT",
        "RIGHT",
        "JOIN",
      ]);
      for (const t of tokens) {
        const v = t.type === "keyword" ? t.value.toUpperCase() : t.value;
        if (breaks.has(v) && out.trim()) out = out.trimEnd() + "\n";
        if (v === ",") out = out.trimEnd() + ", ";
        else if (v === ".") out = out.trimEnd() + ".";
        else if (v === ";") out = out.trimEnd() + ";";
        else out += (out && !/[\s.(]$/.test(out) && v !== ")" ? " " : "") + v;
      }
      return out.trim();
    }
  }
  class SqlExplainer {
    explain(ast) {
      const steps = [];
      if (ast.type !== "select")
        return [
          `Validate ${ast.type.toUpperCase()} syntax.`,
          `Identify target table ${ast.table}.`,
          `Simulate the mutation without touching a real database.`,
        ];
      steps.push(`Read rows from ${ast.from}.`);
      ast.joins.forEach((j) =>
        steps.push(`${j.type} JOIN ${j.table} using ${j.on}.`),
      );
      if (ast.where.length)
        steps.push(`Filter rows using ${ast.where.join(" ")}.`);
      if (ast.groupBy.length)
        steps.push(`Group rows by ${ast.groupBy.join(", ")}.`);
      if (ast.having.length) steps.push("Filter aggregate groups with HAVING.");
      if (ast.orderBy.length) steps.push(`Sort by ${ast.orderBy.join(", ")}.`);
      if (ast.limit !== null)
        steps.push(`Limit the result to ${ast.limit} rows.`);
      steps.push(`Project ${ast.columns.join(", ")} into the final result.`);
      return steps;
    }
  }
  class QuerySimulator {
    constructor(schema) {
      this.schema = schema;
    }
    run(ast) {
      if (ast.type !== "select")
        return {
          columns: ["status", "table"],
          rows: [
            {
              status: `${ast.type.toUpperCase()} simulated safely`,
              table: ast.table,
            },
          ],
          affectedRows: 1,
        };
      const table = this.schema.tables.find(
        (t) => t.name.toLowerCase() === ast.from.toLowerCase(),
      );
      if (!table)
        throw new Error(
          `Table ${ast.from} was not found in the selected schema.`,
        );
      let rows = S.safeClone(table.rows || []);
      if (ast.where.length) rows = this.filterRows(rows, ast.where);
      if (ast.orderBy.length) {
        const field = ast.orderBy[0].split(/\s+/)[0].split(".").pop(),
          desc = /DESC/i.test(ast.orderBy[0]);
        rows.sort(
          (a, b) =>
            String(a[field] ?? "").localeCompare(
              String(b[field] ?? ""),
              undefined,
              { numeric: true },
            ) * (desc ? -1 : 1),
        );
      }
      if (ast.limit !== null) rows = rows.slice(0, ast.limit);
      if (ast.columns.length === 1 && ast.columns[0] === "*")
        return {
          columns: Object.keys(rows[0] || {}),
          rows,
          affectedRows: rows.length,
        };
      const count = ast.columns.some((c) => /COUNT\s*\(/i.test(c));
      if (count && ast.groupBy.length) {
        const f = ast.groupBy[0].split(".").pop(),
          groups = {};
        rows.forEach((r) => (groups[r[f]] = (groups[r[f]] || 0) + 1));
        const grouped = Object.entries(groups).map(([k, v]) => ({
          [f]: k,
          count: v,
        }));
        return {
          columns: [f, "count"],
          rows: grouped,
          affectedRows: grouped.length,
        };
      }
      const cols = ast.columns.map((c) =>
        c
          .replace(/\s+AS\s+.*/i, "")
          .split(".")
          .pop(),
      );
      rows = rows.map((r) => Object.fromEntries(cols.map((c) => [c, r[c]])));
      return { columns: cols, rows, affectedRows: rows.length };
    }
    filterRows(rows, tokens) {
      const text = tokens.join(" ");
      const m = text.match(
        /([\w.]+)\s*(=|!=|<>|>=|<=|>|<)\s*('?[^']*'?|\d+(?:\.\d+)?)/,
      );
      if (!m) return rows;
      const field = m[1].split(".").pop(),
        op = m[2],
        raw = m[3].replace(/^'|'$/g, ""),
        value = isNaN(raw) ? raw : Number(raw);
      return rows.filter(
        (r) =>
          ({
            "=": r[field] == value,
            "!=": r[field] != value,
            "<>": r[field] != value,
            ">": r[field] > value,
            "<": r[field] < value,
            ">=": r[field] >= value,
            "<=": r[field] <= value,
          })[op],
      );
    }
  }
  class QueryHistoryManager {
    add(sql, status) {
      const w = S.loadWorkspace();
      w.sqlHistory.unshift({
        id: S.generateId("query"),
        sql,
        status,
        createdAt: Date.now(),
      });
      S.saveWorkspace(w);
    }
    list() {
      return S.loadWorkspace().sqlHistory;
    }
  }
  let parser, formatter, explainer, history, schema;
  const samples = [
    "SELECT * FROM employees;",
    "SELECT name, status FROM employees WHERE status = 'active';",
    "SELECT department_id, COUNT(*) AS employee_count FROM employees GROUP BY department_id;",
    "SELECT * FROM employees ORDER BY name LIMIT 3;",
    "UPDATE employees SET status = 'active' WHERE id = 3;",
  ];
  function initializeWorkbench() {
    S.initPage("mysql-workbench");
    parser = new SqlParser();
    formatter = new SqlFormatter();
    explainer = new SqlExplainer();
    history = new QueryHistoryManager();
    schema = S.loadWorkspace().databaseSchemas[0];
    loadSchemaBrowser();
    renderQueryHistory();
    renderSaved();
    const sample = document.querySelector("#sample-query");
    sample.innerHTML =
      `<option value="">Load sample query</option>` +
      samples
        .map((q, i) => `<option value="${i}">Sample ${i + 1}</option>`)
        .join("");
    document.querySelector("#sql-editor").value = samples[1];
  }
  function loadSchemaBrowser() {
    const schemas = S.loadWorkspace().databaseSchemas;
    const sel = document.querySelector("#schema-select");
    sel.innerHTML = schemas
      .map((s) => `<option value="${s.id}">${S.escapeHtml(s.name)}</option>`)
      .join("");
    renderSchemaTree();
  }
  function renderSchemaTree() {
    document.querySelector("#schema-tree").innerHTML = schema.tables
      .map(
        (t) =>
          `<details class="list-item schema-table"><summary>${S.escapeHtml(t.name)} <span class="badge">${t.rows?.length || 0} rows</span></summary>${t.columns.map((c) => `<div class="help">${c.primaryKey ? "PK " : c.foreignKey ? "FK " : ""}${S.escapeHtml(c.name)} · ${S.escapeHtml(c.type)}</div>`).join("")}</details>`,
      )
      .join("");
  }
  function tableHtml(result) {
    if (!result.rows.length)
      return S.renderEmptyState("No rows matched this simulation.");
    return `<div class="table-wrap"><table><thead><tr>${result.columns.map((c) => `<th>${S.escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${result.rows.map((r) => `<tr>${result.columns.map((c) => `<td>${S.escapeHtml(r[c])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function runSqlQuery() {
    const sql = document.querySelector("#sql-editor").value;
    try {
      const start = performance.now(),
        ast = parser.parse(sql),
        result = new QuerySimulator(schema).run(ast),
        duration = performance.now() - start;
      document.querySelector("#query-results").innerHTML = tableHtml(result);
      document.querySelector("#query-stats").innerHTML =
        `<div class="stat-value">${result.affectedRows}</div><div class="stat-label">rows · ${duration.toFixed(2)} ms simulation</div>`;
      renderExplanation(ast);
      history.add(sql, "Simulated");
      renderQueryHistory();
      S.addActivityLog("MySQL Workbench", "Ran simulation", ast.type);
      S.showStatus("Query simulated locally.", "success");
    } catch (e) {
      history.add(sql, "Error");
      renderQueryHistory();
      S.showStatus(e.message, "error");
    }
  }
  function formatSqlQuery() {
    try {
      document.querySelector("#sql-editor").value = formatter.format(
        document.querySelector("#sql-editor").value,
      );
      S.showStatus("SQL formatted.", "success");
    } catch (e) {
      S.showStatus(e.message, "error");
    }
  }
  function renderExplanation(ast) {
    document.querySelector("#explanation").innerHTML = explainer
      .explain(ast)
      .map(
        (x, i) =>
          `<div class="list-item"><strong>${i + 1}.</strong> ${S.escapeHtml(x)}</div>`,
      )
      .join("");
  }
  function explainSqlQuery() {
    try {
      renderExplanation(
        parser.parse(document.querySelector("#sql-editor").value),
      );
    } catch (e) {
      S.showStatus(e.message, "error");
    }
  }
  function simulateSqlExecution() {
    runSqlQuery();
  }
  function saveCurrentQuery() {
    const sql = document.querySelector("#sql-editor").value.trim();
    if (!sql) return S.showStatus("Enter a query first.", "warning");
    const name = prompt("Saved query name", "Untitled query");
    if (!name) return;
    const w = S.loadWorkspace();
    w.savedQueries.unshift({
      id: S.generateId("saved"),
      name,
      sql,
      createdAt: Date.now(),
    });
    S.saveWorkspace(w);
    renderSaved();
    S.showStatus("Query saved.", "success");
  }
  function renderQueryHistory() {
    document.querySelector("#query-history").innerHTML = history
      .list()
      .slice(0, 12)
      .map(
        (q) =>
          `<button class="list-item btn-small history-item" data-sql="${encodeURIComponent(q.sql)}"><strong>${S.escapeHtml(q.status)}</strong><div class="help">${S.formatTimestamp(q.createdAt)}</div></button>`,
      )
      .join("");
  }
  function renderSaved() {
    document.querySelector("#saved-queries").innerHTML = S.loadWorkspace()
      .savedQueries.map(
        (q) =>
          `<div class="list-item"><button class="btn btn-small saved-load" data-id="${q.id}">${S.escapeHtml(q.name)}</button><button class="btn btn-small btn-danger saved-delete" data-id="${q.id}">×</button></div>`,
      )
      .join("");
  }
  function loadSavedQuery(id) {
    const q = S.loadWorkspace().savedQueries.find((x) => x.id === id);
    if (q) document.querySelector("#sql-editor").value = q.sql;
  }
  function deleteSavedQuery(id) {
    const w = S.loadWorkspace();
    w.savedQueries = w.savedQueries.filter((x) => x.id !== id);
    S.saveWorkspace(w);
    renderSaved();
  }
  async function importSqlFile(event) {
    try {
      document.querySelector("#sql-editor").value = await S.readTextFile(
        event.target.files[0],
      );
      S.showStatus("SQL imported.", "success");
    } catch (e) {
      S.showStatus(e.message, "error");
    }
  }
  function exportSqlFile() {
    S.downloadText(
      "query.sql",
      document.querySelector("#sql-editor").value,
      "text/sql",
    );
  }
  document.addEventListener("DOMContentLoaded", () => {
    initializeWorkbench();
    document.querySelector("#run-query").onclick = runSqlQuery;
    document.querySelector("#format-sql").onclick = formatSqlQuery;
    document.querySelector("#explain-sql").onclick = explainSqlQuery;
    document.querySelector("#save-query").onclick = saveCurrentQuery;
    document.querySelector("#copy-sql").onclick = () =>
      S.copyText(document.querySelector("#sql-editor").value);
    document.querySelector("#export-sql").onclick = exportSqlFile;
    document.querySelector("#sql-import").onchange = importSqlFile;
    document.querySelector("#sample-query").onchange = (e) => {
      if (e.target.value !== "")
        document.querySelector("#sql-editor").value =
          samples[Number(e.target.value)];
    };
    document.addEventListener("click", (e) => {
      const h = e.target.closest(".history-item");
      if (h)
        document.querySelector("#sql-editor").value = decodeURIComponent(
          h.dataset.sql,
        );
      const l = e.target.closest(".saved-load");
      if (l) loadSavedQuery(l.dataset.id);
      const d = e.target.closest(".saved-delete");
      if (d) deleteSavedQuery(d.dataset.id);
    });
  });
  Object.assign(S, {
    SqlTokenizer,
    SqlParser,
    SqlFormatter,
    SqlExplainer,
    QuerySimulator,
    QueryHistoryManager,
  });
  Object.assign(window, {
    initializeWorkbench,
    loadSchemaBrowser,
    renderSchemaTree,
    runSqlQuery,
    formatSqlQuery,
    explainSqlQuery,
    simulateSqlExecution,
    saveCurrentQuery,
    renderQueryHistory,
    loadSavedQuery,
    deleteSavedQuery,
    importSqlFile,
    exportSqlFile,
  });
})();
