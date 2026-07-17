(function () {
  "use strict";
  const S = EngineeringStudio;
  let draft;
  const themeFields = [
      "bg",
      "bgSoft",
      "surface",
      "surfaceStrong",
      "text",
      "muted",
      "primary",
      "secondary",
      "success",
      "warning",
      "danger",
      "info",
      "border",
      "fontFamily",
      "fontMono",
      "radius",
      "radiusSmall",
    ],
    settingFields = [
      "compactSidebar",
      "transitionSpeedMs",
      "loaderDelayMs",
      "loaderLabel",
      "animationSpeedMs",
      "canvasGridSize",
      "snapDistance",
      "defaultZoom",
      "defaultPageSize",
      "reducedMotion",
      "sidebarWidth",
      "panelPadding",
    ];
  const colorFields = new Set([
    "bg",
    "bgSoft",
    "text",
    "muted",
    "primary",
    "secondary",
    "success",
    "warning",
    "danger",
    "info",
  ]);
  function field(key, value, group) {
    const type =
      typeof value === "boolean"
        ? "checkbox"
        : typeof value === "number"
          ? "number"
          : colorFields.has(key)
            ? "color"
            : "text";
    return `<div class="field"><label for="${group}-${key}">${S.escapeHtml(key.replace(/[A-Z]/g, (m) => ` ${m}`).replace(/^./, (x) => x.toUpperCase()))}</label><input class="input setting-input" id="${group}-${key}" data-group="${group}" data-key="${key}" type="${type}" ${type === "checkbox" ? (value ? "checked" : "") : `value="${S.escapeHtml(value)}"`}></div>`;
  }
  function renderSettingsForm() {
    draft = S.loadWorkspace();
    renderThemeCustomizer();
    renderLayoutCustomizer();
  }
  function renderThemeCustomizer() {
    document.querySelector("#theme-settings").innerHTML =
      `${field("name", draft.brand.name, "brand")}${field("tagline", draft.brand.tagline, "brand")}` +
      themeFields.map((k) => field(k, draft.theme[k], "theme")).join("");
  }
  function renderLayoutCustomizer() {
    document.querySelector("#layout-settings").innerHTML = settingFields
      .map((k) => field(k, draft.settings[k], "settings"))
      .join("");
  }
  function renderAnimationSettings() {
    renderLayoutCustomizer();
  }
  function updateThemeToken(name, value) {
    draft.theme[name] = value;
    document.documentElement.style.setProperty(
      `--${name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`,
      typeof value === "number" ? `${value}px` : value,
    );
  }
  function updateSetting(name, value) {
    draft.settings[name] = value;
    if (name === "panelPadding")
      document.documentElement.style.setProperty(
        "--panel-padding",
        `${value}px`,
      );
    if (name === "sidebarWidth")
      document.documentElement.style.setProperty(
        "--sidebar-width",
        `${value}px`,
      );
  }
  function saveSettings() {
    S.saveWorkspace(draft);
    S.applyThemeSettings();
    S.applyLayoutSettings();
    S.showStatus("Workspace settings saved.", "success");
  }
  function resetTheme() {
    draft.theme = S.safeClone(S.defaultWorkspace.theme);
    renderSettingsForm();
    Object.entries(draft.theme).forEach(([k, v]) => updateThemeToken(k, v));
  }
  function resetLayout() {
    draft.settings = S.safeClone(S.defaultWorkspace.settings);
    renderSettingsForm();
    S.showStatus("Layout defaults restored in preview.", "success");
  }
  function exportWorkspace() {
    S.downloadJson("engineering-studio-workspace.json", S.loadWorkspace());
  }
  async function importWorkspace(event) {
    try {
      const data = S.parseJson(await S.readTextFile(event.target.files[0]));
      if (!data.brand || !data.settings || !data.theme)
        throw new Error("This is not a valid Engineering Studio workspace.");
      S.saveWorkspace(data);
      location.reload();
    } catch (e) {
      S.showStatus(e.message, "error");
    }
  }
  function resetDemoWorkspace() {
    if (confirm("Reset all workspace content to demo data?")) {
      S.resetWorkspace();
      location.reload();
    }
  }
  function clearWorkspace() {
    if (confirm("Clear all locally stored workspace data?")) {
      localStorage.removeItem(S.STORAGE_KEY);
      S.showStatus(
        "Workspace cleared. Refresh to reseed demo data.",
        "warning",
      );
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    S.initPage("settings");
    renderSettingsForm();
    document.querySelector("#settings-form").addEventListener("input", (e) => {
      const el = e.target;
      if (!el.matches(".setting-input")) return;
      let value =
        el.type === "checkbox"
          ? el.checked
          : el.type === "number"
            ? Number(el.value)
            : el.value;
      if (el.dataset.group === "theme") updateThemeToken(el.dataset.key, value);
      else if (el.dataset.group === "settings")
        updateSetting(el.dataset.key, value);
      else draft.brand[el.dataset.key] = value;
    });
    document.querySelector("#settings-form").onsubmit = (e) => {
      e.preventDefault();
      saveSettings();
    };
    document.querySelector("#reset-theme").onclick = resetTheme;
    document.querySelector("#reset-layout").onclick = resetLayout;
    document.querySelector("#export-workspace").onclick = exportWorkspace;
    document.querySelector("#import-workspace").onchange = importWorkspace;
    document.querySelector("#reset-demo").onclick = resetDemoWorkspace;
    document.querySelector("#clear-workspace").onclick = clearWorkspace;
  });
  Object.assign(window, {
    renderSettingsForm,
    renderThemeCustomizer,
    renderLayoutCustomizer,
    renderAnimationSettings,
    updateThemeToken,
    updateSetting,
    saveSettings,
    resetTheme,
    resetLayout,
    exportWorkspace,
    importWorkspace,
    resetDemoWorkspace,
    clearWorkspace,
  });
})();
