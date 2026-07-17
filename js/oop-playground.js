(function () {
  "use strict";
  const S = EngineeringStudio;
  let classes = [],
    instances = [];
  const demos = [
    {
      name: "Employee inheritance",
      classes: [
        {
          id: "person",
          name: "Person",
          parentClassId: "",
          properties: ["name"],
          methods: ["describe()"],
        },
        {
          id: "employee",
          name: "Employee",
          parentClassId: "person",
          properties: ["role"],
          methods: ["describe()", "work()"],
        },
      ],
    },
    {
      name: "Shape polymorphism",
      classes: [
        {
          id: "shape",
          name: "Shape",
          parentClassId: "",
          properties: ["color"],
          methods: ["area()"],
        },
        {
          id: "circle",
          name: "Circle",
          parentClassId: "shape",
          properties: ["radius"],
          methods: ["area()"],
        },
        {
          id: "square",
          name: "Square",
          parentClassId: "shape",
          properties: ["side"],
          methods: ["area()"],
        },
      ],
    },
  ];
  function render() {
    document.querySelector("#class-model").innerHTML = classes
      .map(
        (c) =>
          `<article class="node class-card"><h3>${S.escapeHtml(c.name)}</h3><div class="help">extends ${S.escapeHtml(classes.find((p) => p.id === c.parentClassId)?.name || "Object")}</div>${c.properties.map((p) => `<div class="member">+ ${S.escapeHtml(p)}</div>`).join("")}${c.methods.map((m) => `<div class="member inherited">ƒ ${S.escapeHtml(m)}</div>`).join("")}<button class="btn btn-small add-method" data-id="${c.id}">Add method</button></article>`,
      )
      .join("");
    document.querySelector("#instance-model").innerHTML = instances.length
      ? instances
          .map(
            (i) =>
              `<div class="list-item"><strong>${S.escapeHtml(i.name)}</strong> : ${S.escapeHtml(classes.find((c) => c.id === i.classId)?.name)}<div class="help">Own values: ${S.escapeHtml(JSON.stringify(i.values))}</div><button class="btn btn-small call-method" data-id="${i.id}">Resolve method</button></div>`,
          )
          .join("")
      : S.renderEmptyState("Create an instance to inspect object memory.");
    renderPrototypeChain();
  }
  function createClass() {
    const name = prompt("Class name", "NewClass");
    if (!name) return;
    const parent = prompt(
      `Parent class (${classes.map((c) => c.name).join(", ")})`,
      "",
    );
    classes.push({
      id: S.generateId("class"),
      name,
      parentClassId: classes.find((c) => c.name === parent)?.id || "",
      properties: [],
      methods: [],
    });
    render();
  }
  function addProperty(classId) {
    const c = classes.find((x) => x.id === classId),
      name = prompt("Property name", "value");
    if (name) c.properties.push(name);
    render();
  }
  function addMethod(classId) {
    const c = classes.find((x) => x.id === classId),
      name = prompt("Method signature", "describe()");
    if (name) c.methods.push(name);
    render();
  }
  function chooseParentClass(classId, parentClassId) {
    const c = classes.find((x) => x.id === classId);
    if (c) c.parentClassId = parentClassId;
    render();
  }
  function createInstance() {
    if (!classes.length) return;
    const c = classes.at(-1),
      name = prompt("Instance name", c.name.toLowerCase() + "1");
    if (name)
      instances.push({
        id: S.generateId("instance"),
        name,
        classId: c.id,
        values: Object.fromEntries(c.properties.map((p) => [p, `sample ${p}`])),
      });
    render();
  }
  function callMethod(instanceId) {
    const i = instances.find((x) => x.id === instanceId),
      c = classes.find((x) => x.id === i.classId);
    const method = prompt("Method name", "describe()");
    let cursor = c,
      path = [];
    while (cursor) {
      path.push(cursor.name);
      if (cursor.methods.includes(method)) {
        S.showStatus(
          `${method} resolved on ${cursor.name} via ${path.join(" → ")}.`,
          "success",
        );
        return;
      }
      cursor = classes.find((x) => x.id === cursor.parentClassId);
    }
    S.showStatus(`${method} was not found on the prototype chain.`, "warning");
  }
  function overrideMethod(classId, method) {
    const c = classes.find((x) => x.id === classId);
    if (c && !c.methods.includes(method)) c.methods.push(method);
    render();
  }
  function inspectPrototypeChain(classId = classes.at(-1)?.id) {
    let c = classes.find((x) => x.id === classId),
      out = [];
    while (c) {
      out.push(c);
      c = classes.find((x) => x.id === c.parentClassId);
    }
    return out;
  }
  function renderPrototypeChain() {
    const chain = inspectPrototypeChain();
    document.querySelector("#prototype-chain").innerHTML =
      chain
        .map((c) => `<div class="node">${S.escapeHtml(c.name)}.prototype</div>`)
        .join("") + `<div class="node">Object.prototype</div>`;
  }
  function saveOopProject() {
    const w = S.loadWorkspace();
    w.oopProjects.unshift({
      id: S.generateId("oop"),
      name: "Custom model",
      classes: S.safeClone(classes),
      instances: S.safeClone(instances),
    });
    S.saveWorkspace(w);
  }
  function loadOopDemo(i) {
    const demo = demos[Number(i)] || demos[0];
    classes = S.safeClone(demo.classes);
    instances = [];
    render();
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("oop-playground");
    const sel = document.querySelector("#oop-demo");
    sel.innerHTML = demos
      .map((d, i) => `<option value="${i}">${S.escapeHtml(d.name)}</option>`)
      .join("");
    loadOopDemo(0);
    sel.onchange = (e) => loadOopDemo(e.target.value);
    document.querySelector("#create-class").onclick = createClass;
    document.querySelector("#create-instance").onclick = createInstance;
    document.addEventListener("click", (e) => {
      const a = e.target.closest(".add-method");
      if (a) addMethod(a.dataset.id);
      const c = e.target.closest(".call-method");
      if (c) callMethod(c.dataset.id);
    });
  });
  Object.assign(window, {
    createClass,
    addProperty,
    addMethod,
    chooseParentClass,
    createInstance,
    callMethod,
    overrideMethod,
    inspectPrototypeChain,
    renderPrototypeChain,
    saveOopProject,
    loadOopDemo,
  });
})();
