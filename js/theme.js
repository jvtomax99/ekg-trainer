/* App theme (system / light / dark) and strip colors (auto / paper / green / amber).
   Loaded in <head> before the stylesheet so the first paint already has the right theme.
   Reads ekg.prefs.v1 directly; the fields are additive (no key bump). */
(function (root) {
  "use strict";
  const doc = root.document.documentElement;
  const mq = root.matchMedia ? root.matchMedia("(prefers-color-scheme: dark)") : null;
  const listeners = [];
  let pref = { theme: "system", strip: "auto" };

  function readPrefs() {
    try {
      const f = JSON.parse(root.localStorage.getItem("ekg.prefs.v1") || "{}");
      return { theme: f.theme || "system", strip: f.strip || "auto" };
    } catch (e) { return { theme: "system", strip: "auto" }; }
  }
  function resolved() {
    const theme = pref.theme === "light" || pref.theme === "dark" ? pref.theme : (mq && mq.matches ? "dark" : "light");
    const strip = pref.strip === "paper" || pref.strip === "green" || pref.strip === "amber" ? pref.strip : (theme === "dark" ? "green" : "paper");
    return { theme: theme, strip: strip };
  }
  function meta(name, content) {
    let m = root.document.querySelector('meta[name="' + name + '"]');
    if (m) m.setAttribute("content", content);
  }
  function apply(p) {
    if (p) pref = { theme: p.theme || "system", strip: p.strip || "auto" };
    const r = resolved();
    doc.setAttribute("data-theme", r.theme);
    doc.setAttribute("data-strip", r.strip);
    meta("theme-color", r.theme === "dark" ? "#090e13" : "#f3f6f9");
    meta("color-scheme", r.theme);
    // iPhone Home Screen app: dark text on the light theme, light text on dark.
    meta("apple-mobile-web-app-status-bar-style", r.theme === "dark" ? "black-translucent" : "default");
    listeners.forEach(function (fn) { fn(r); });
    return r;
  }
  if (mq) {
    const onSys = function () { if (pref.theme === "system" || pref.strip === "auto") apply(); };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }

  pref = readPrefs();
  apply();
  // The start menu (js/start.js) covers the app from the first paint, unless Settings turned
  // the opening film off. ?start=0 skips it (dev scripts).
  try {
    const f = JSON.parse(root.localStorage.getItem("ekg.prefs.v1") || "{}");
    if (f.film !== "off" && !/[?&]start=0(&|$)/.test(root.location.search)) doc.classList.add("start-on");
  } catch (e) { doc.classList.add("start-on"); }
  root.EKG = root.EKG || {};
  root.EKG.theme = {
    apply: apply, resolved: resolved,
    onChange: function (fn) { listeners.push(fn); }
  };
})(window);
