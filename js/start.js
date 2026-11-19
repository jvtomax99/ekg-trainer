/* Start menu and opening film (step 3c, docs/phases/6-start-menu-film.md).
   The menu shows each time the app opens: the film's first frame (hands on the unit doors), the name,
   and two buttons. The tap is what a phone needs before it will play sound.
   Then the film (img/film/open.mp4, cut by tools/make-open-film.sh): doors, the walk, the station,
   a strip, the dash, the title. The strip is not in the footage: this file draws it with the app's
   own generator over a blurred stretch of the film, and every word is real text, on the film's clock
   (FILM below must match the cut).
   Optional in every way: Home is drawn underneath from the start. No film on Reduce Motion or data
   saver, when it can't start within a moment of the tap, or when it breaks: the app just opens.
   js/theme.js decides before the first paint whether the menu shows (html.start-on). */
(function (root) {
  "use strict";
  const doc = root.document, html = doc.documentElement;
  const el = doc.getElementById("start");
  const waiting = [];
  let state = "idle"; // idle, menu, starting, film, leaving
  const api = {
    active: function () { return state !== "idle"; },
    whenDone: function (fn) { if (state === "idle") fn(); else waiting.push(fn); },
    replay: function () {}
  };
  root.EKG = root.EKG || {};
  root.EKG.start = api;
  if (!el) { html.classList.remove("start-on"); return; }

  const FILM = {
    src: "img/film/open.mp4",
    caps: [[0.5, 2.2, "Night shift."], [2.7, 5.0, "Every room has a rhythm."], [5.4, 6.7, "One just changed."], [10.5, 12.4, "Know it. Move."]],
    mon: [6.8, 10.1],   // the blurred stretch where the strip is drawn
    pre: 3,             // seconds of sweep already on the screen when the strip appears
    ans: 8.8,           // the question turns into the rhythm's name
    title: 12.8,
    rhythm: "vt",
    wait: 2500,         // how long a tap waits for the film to start, in ms
    hold: 700           // the last frame is held this long, in ms
  };
  const MEDIA = "ekg-media-v1";
  const $ = function (s) { return el.querySelector(s); };
  const vid = $(".st-film"), menu = $(".st-menu"), skipBtn = $(".st-skip");
  const cap = $(".st-cap"), mon = $(".st-mon"), ask = $(".st-ask"), title = $(".st-title");
  const others = [].slice.call(doc.querySelectorAll("body > header, body > main, body > nav"));
  const prefs = function () { return root.EKG.progress.prefs(); };
  const reduce = function () { return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches); };
  const saver = function () { const c = root.navigator && root.navigator.connection; return !!(c && c.saveData); };
  const today = function () { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };

  let timers = [], raf = 0, stopLive = null, moved = 0, lastT = -1, replayed = false, stored = false, blobUrl = null, began = false, tint = null;
  const meta = doc.querySelector('meta[name="theme-color"]');
  const later = function (fn, ms) { timers.push(root.setTimeout(fn, ms)); };
  const clearTimers = function () { timers.forEach(root.clearTimeout); timers = []; };

  // The film plays unless Settings says once a day and today's showing is done.
  function wanted() {
    if (replayed) return true; // asked for by name in About, so it plays even on Reduce Motion
    if (reduce() || saver()) return false;
    const f = prefs();
    return !(f.film === "day" && f.filmDay === today());
  }

  // A stored copy plays from memory (works offline). Without one the phone streams it, and
  // a copy is stored afterwards for next time.
  function load() {
    if (!wanted() || vid.getAttribute("src")) { if (vid.error) vid.load(); return; }
    const stream = function () { if (!vid.getAttribute("src")) { vid.src = FILM.src; vid.load(); } };
    if (!root.caches) return stream();
    root.caches.open(MEDIA).then(function (c) { return c.match(FILM.src); }).then(function (hit) {
      if (!hit) return stream();
      stored = true;
      return hit.blob().then(function (b) {
        if (vid.getAttribute("src")) return;
        blobUrl = root.URL.createObjectURL(b); vid.src = blobUrl; vid.load();
      });
    }).catch(stream);
  }
  function store() {
    if (stored || !root.caches || !root.fetch || saver()) return;
    stored = true;
    root.fetch(FILM.src).then(function (r) {
      if (!r.ok) throw new Error("no film");
      return root.caches.open(MEDIA).then(function (c) { return c.put(FILM.src, r); });
    }).catch(function () { stored = false; });
  }

  function open(fromReplay) {
    clearTimers();
    replayed = !!fromReplay; state = "menu"; began = false;
    if (meta) { tint = meta.getAttribute("content"); meta.setAttribute("content", "#05090d"); }
    html.classList.add("start-on");
    el.classList.remove("is-film", "is-wait", "is-title"); el.style.opacity = "";
    menu.inert = false; skipBtn.hidden = true;
    others.forEach(function (n) { n.inert = true; });
    reset();
    load();
    const b = $(".st-go");
    if (b) b.focus({ preventScroll: true });
  }
  function reset() {
    cap.textContent = ""; cap.classList.remove("on");
    mon.classList.remove("on"); title.classList.remove("on"); ask.classList.remove("known");
    if (stopLive) { stopLive(); stopLive = null; }
    vid.classList.remove("on"); lastT = -1;
    try { vid.pause(); if (vid.readyState > 0) vid.currentTime = 0; } catch (e) { /* not loaded yet */ }
  }

  function start(withSound) {
    if (state !== "menu") return;
    if (!wanted() || !vid.getAttribute("src") || vid.error) return finish();
    state = "starting";
    menu.inert = true; el.classList.add("is-wait");
    let p = null;
    try { vid.muted = !withSound; vid.volume = 1; p = vid.play(); } catch (e) { return finish(); }
    const begin = function () {
      if (state !== "starting") return;
      state = "film"; began = true; clearTimers();
      el.classList.remove("is-wait"); el.classList.add("is-film");
      vid.classList.add("on");
      skipBtn.hidden = false; skipBtn.focus({ preventScroll: true });
      moved = root.performance.now();
      raf = root.requestAnimationFrame(tick);
    };
    const giveUp = function () { if (state === "starting") { vid.removeEventListener("playing", begin); finish(); } };
    vid.addEventListener("playing", begin, { once: true });
    if (p && p.catch) p.catch(giveUp);
    later(giveUp, FILM.wait);
  }

  // The words and the strip follow the film's own clock.
  function tick(now) {
    if (state !== "film") return;
    raf = root.requestAnimationFrame(tick);
    const t = vid.currentTime;
    if (t !== lastT) { lastT = t; moved = now; }
    else if (now - moved > 3000) return leave(true); // frozen, or paused by the phone and not coming back
    let line = "";
    FILM.caps.forEach(function (c) { if (t >= c[0] && t < c[1]) line = c[2]; });
    if (line) { if (cap.textContent !== line) cap.textContent = line; cap.classList.add("on"); } else cap.classList.remove("on");
    if (!stopLive && t >= FILM.mon[0] - FILM.pre && t < FILM.mon[1]) sweep();
    const showMon = t >= FILM.mon[0] && t < FILM.mon[1];
    mon.classList.toggle("on", showMon);
    ask.classList.toggle("known", t >= FILM.ans);
    if (stopLive && t >= FILM.mon[1] + 0.5) { stopLive(); stopLive = null; }
    title.classList.toggle("on", t >= FILM.title);
    el.classList.toggle("is-title", t >= FILM.title);
  }
  function sweep() {
    const E = root.EKG, canvas = mon.querySelector("canvas");
    const r = E.rhythms.byId[FILM.rhythm];
    $(".st-name").textContent = r.name;
    try { stopLive = E.strip.live(canvas, E.ecg.generate(FILM.rhythm)); } catch (e) { stopLive = function () {}; }
  }

  function leave(fast) {
    if (state === "idle" || state === "leaving") return;
    state = "leaving"; clearTimers();
    root.cancelAnimationFrame(raf);
    vid.muted = true;
    el.style.transition = "opacity " + (fast ? 0.25 : 0.6) + "s ease"; el.style.opacity = "0";
    later(finish, fast ? 260 : 620);
  }
  function finish() {
    clearTimers(); root.cancelAnimationFrame(raf);
    const played = began;
    state = "idle"; began = false;
    try { vid.pause(); vid.muted = true; } catch (e) { /* nothing playing */ }
    html.classList.remove("start-on");
    el.style.transition = ""; el.style.opacity = "";
    others.forEach(function (n) { n.inert = false; });
    reset();
    if (meta && tint) meta.setAttribute("content", tint);
    if (played && !replayed) { const f = prefs(); if (f.filmDay !== today()) { f.filmDay = today(); root.EKG.progress.savePrefs(f); } }
    if (wanted() || played) store();
    waiting.splice(0).forEach(function (fn) { fn(); });
  }

  $(".st-go").addEventListener("click", function () { start(true); });
  $(".st-quiet").addEventListener("click", function () { start(false); });
  skipBtn.addEventListener("click", function () { leave(true); });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || state === "idle") return;
    e.preventDefault();
    if (state === "menu" || state === "starting") finish(); else leave(true);
  });
  vid.addEventListener("ended", function () { if (state === "film") later(function () { leave(false); }, FILM.hold); });
  vid.addEventListener("error", function () { if (state === "film" || state === "starting") leave(true); });
  // Paused by the phone (a call, headphones off) while still on screen: carry on, or open the app.
  vid.addEventListener("pause", function () {
    if (state !== "film" || doc.hidden || vid.ended) return;
    const p = vid.play(); if (p && p.catch) p.catch(function () { leave(true); });
  });
  // Back from another app: the phone paused the film; carry on.
  doc.addEventListener("visibilitychange", function () {
    if (doc.hidden || state !== "film") return;
    moved = root.performance.now();
    const p = vid.play(); if (p && p.catch) p.catch(function () { leave(true); });
  });

  api.replay = function () { if (state === "idle") open(true); };
  if (html.classList.contains("start-on")) open(false);
})(window);
