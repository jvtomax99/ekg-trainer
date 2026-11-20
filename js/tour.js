/* First-launch intro: 9 swipeable cards with real screenshots of this app.
   Skip on every card; Replay from About. All text is hard-coded or set via textContent. */
(function (root) {
  "use strict";
  const VERSION = 1;
  const SVGNS = "http://www.w3.org/2000/svg";

  function h(tag, props) {
    const el = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (let i = 2; i < arguments.length; i++) {
      const c = arguments[i];
      if (c == null || c === false) continue;
      [].concat(c).forEach(function (x) { el.append(typeof x === "string" ? document.createTextNode(x) : x); });
    }
    return el;
  }
  function icon(nm) {
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "ic");
    svg.setAttribute("aria-hidden", "true");
    const u = document.createElementNS(SVGNS, "use");
    u.setAttribute("href", "#" + nm);
    svg.append(u);
    return svg;
  }
  function shot(file, alt) { return h("img", { class: "tour-shot", src: "img/tour/" + file, alt: alt, decoding: "async", width: "390", height: "844" }); }
  function item(ic, text, cls) { return h("li", { class: cls || null }, icon(ic), h("span", { text: text })); }
  function step(ic, text) { return h("li", null, h("span", { class: "key" }, icon(ic)), h("span", { text: text })); }

  function cards(opts) {
    return [
      [h("img", { class: "tour-hero", src: "icons/icon-512.png", alt: "" }),
        h("h2", { text: "Read rhythm strips faster" }),
        h("p", { text: "Practice for telemetry and stepdown rhythm exams, on strips made fresh every time." }),
        h("p", { class: "small", text: "A study tool with computer-generated strips. Not for patient care decisions. Follow your unit's protocols and provider orders." })],
      [shot("home.webp", "Home tab: monitor header, continue studying, suggested next, accuracy by group"),
        h("h2", { text: "Five tabs, one thumb" }),
        h("p", { text: "Home picks up where you left off." })],
      [shot("learn.webp", "Learn tab: the 5-step method and rhythm groups"),
        h("h2", { text: "Same 5 steps on every strip" }),
        h("p", { text: "Rate, rhythm, P waves, PR, QRS." })],
      [shot("practice.webp", "Practice: calipers measuring an R-R interval, answer feedback below"),
        h("h2", { text: "Every answer explains itself" }),
        h("p", { text: "See what the strip shows and why the other choices don't fit." })],
      [shot("progress.webp", "Progress: mastery by rhythm group with recall and next review"),
        h("h2", { text: "Misses come back until you own them" }),
        h("p", { text: "A miss returns in minutes, then at longer gaps." })],
      [shot("exam.webp", "Exam: timed strip with countdown bar"),
        h("h2", { text: "Practice the clock" }),
        h("p", { text: "Timed strips, a pass mark and a lethal-rhythm rule." })],
      [h("span", { class: "ic-chip", style: "width:64px;height:64px;border-radius:18px;margin-top:3dvh" }, icon("i-sources")),
        h("h2", { text: "What this is, and what it isn't" }),
        h("ul", { class: "tour-list" },
          item("i-check", "Criteria cite published references (LITFL, StatPearls, ACC/AHA guidelines), listed in About."),
          item("i-check", "Strips are generated fresh by code, so you can't memorize them."),
          item("i-check", "Explanations come from each strip's own measurements."),
          item("i-info", "Content is still pending review by a practicing nurse.", "no"),
          item("i-info", "Not clinically validated, not endorsed by any hospital or exam provider, and not a copy of any exam.", "no"))],
      opts.standalone
        ? [h("img", { class: "tour-hero", src: "icons/icon-512.png", alt: "", style: "width:84px;height:84px;border-radius:19px" }),
          h("h2", { text: "You're on the Home Screen" }),
          h("p", { text: "You opened EKG Trainer from its icon. Keep using it from there." })]
        : [h("img", { class: "tour-hero", src: "icons/icon-512.png", alt: "", style: "width:84px;height:84px;border-radius:19px" }),
          h("h2", { text: "Put it on your Home Screen" }),
          h("p", { text: "Thirty seconds now, one tap every shift after." }),
          h("ul", { class: "tour-list tour-steps" },
            step("i-share", "In Safari, tap Share (on newer iOS it may be under •••)."),
            step("i-addhome", "Tap Add to Home Screen, then Add."),
            step("i-play", "Open EKG Trainer from its icon."))],
      [h("span", { class: "ic-chip", style: "width:64px;height:64px;border-radius:18px;margin-top:3dvh" }, icon("i-info")),
        h("h2", { text: "Works offline, stays on this phone" }),
        h("p", { text: "Know these before you rely on it." }),
        h("ul", { class: "tour-list" },
          item("i-check", "Works offline after this first visit. Updates arrive next time you have signal."),
          item("i-info", "No sync or backup yet.", "no"),
          item("i-info", "Safari and the Home Screen app keep separate progress. Stick with the icon.", "no"),
          item("i-info", "Clearing Safari website data erases your progress.", "no"))]
    ];
  }

  function open(dlg, opts) {
    opts = opts || {};
    while (dlg.firstChild) dlg.removeChild(dlg.firstChild);
    const list = cards(opts);
    const n = list.length;
    let i = 0, done = false;
    const count = h("span", { class: "tour-count", "aria-live": "polite" });
    const track = h("div", { class: "tour-track", tabindex: "-1", autofocus: true });
    list.forEach(function (c, k) {
      track.append(h("section", { class: "tour-card", "aria-roledescription": "slide", "aria-label": (k + 1) + " of " + n }, c));
    });
    const dots = h("div", { class: "dots", "aria-hidden": "true" });
    for (let k = 0; k < n; k++) dots.append(h("i"));
    const next = h("button", { type: "button", class: "btn primary", onclick: function () {
      if (i >= n - 1) finish(); else go(i + 1);
    } });
    const skip = h("button", { type: "button", class: "btn small ghost", text: "Skip", onclick: function () { finish(); } });
    dlg.append(h("div", { class: "tour-top" }, count, skip), track, h("div", { class: "tour-bottom" }, dots, next));

    function paint() {
      count.textContent = (i + 1) + " / " + n;
      [].forEach.call(dots.children, function (d, k) { d.classList.toggle("on", k === i); });
      next.textContent = i >= n - 1 ? "Start practicing" : "Next";
      skip.hidden = i >= n - 1;
    }
    function go(k) {
      i = Math.max(0, Math.min(n - 1, k));
      track.scrollTo({ left: i * track.clientWidth, behavior: opts.reduceMotion ? "auto" : "smooth" });
      paint();
    }
    let st = 0;
    track.addEventListener("scroll", function () {
      clearTimeout(st);
      st = setTimeout(function () {
        const k = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        if (k !== i) { i = k; paint(); }
      }, 60);
    });
    function finish() {
      if (done) return;
      done = true;
      if (dlg.open) dlg.close();
      if (opts.onDone) opts.onDone();
    }
    dlg.oncancel = function () { finish(); };
    dlg.onkeydown = function (ev) {
      if (ev.key === "ArrowRight") go(i + 1);
      if (ev.key === "ArrowLeft") go(i - 1);
    };
    paint();
    dlg.showModal();
    track.scrollLeft = 0;
  }

  root.EKG = root.EKG || {};
  root.EKG.tour = { open: open, VERSION: VERSION };
})(typeof window !== "undefined" ? window : globalThis);
