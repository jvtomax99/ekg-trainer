/* Night unit backdrop (step 3b, docs/phases/5-night-unit-start.md).
   A generated picture of a generic unit hallway (lit by day, dimmed at night) behind Home's start card, and "Rounds":
   a hallway clip that moves about one second as each practice card comes up, then holds.
   Optional in every way: the picture is precached, the clip is fetched after the app is
   open and the app works the same if it never arrives. Never used in Exam. */
(function (root) {
  "use strict";
  const doc = root.document;
  // Two looks of the same hallway: lights on by day, dimmed at night. "Auto" goes by the
  // phone's clock (lit from 7 in the morning to 7 at night); Settings can pin either one.
  const LOOKS = {
    lit: { name: "lit", still: "img/unit/unit-lit.webp", clip: "img/unit/walk-lit.mp4" },
    night: { name: "night", still: "img/unit/unit.webp", clip: "img/unit/walk.mp4" }
  };
  function lookName(now) {
    const u = root.EKG.progress.prefs().unit;
    if (u === "lit" || u === "night") return u;
    const hr = (now || new Date()).getHours();
    return hr >= 7 && hr < 19 ? "lit" : "night";
  }
  function look() { return LOOKS[lookName()]; }
  const MEDIA = "ekg-media-v1"; // its own offline store, so app updates don't throw the clip away
  const STEP = 1; // seconds of walking per card
  const clipUrl = {}, clipWait = {};

  function prefs() { return root.EKG.progress.prefs(); }
  function enabled() { return prefs().unit !== "off"; }
  function reduceMotion() { return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function saveData() { const c = root.navigator && root.navigator.connection; return !!(c && c.saveData); }
  function underStart() { return !!(root.EKG.start && root.EKG.start.active()); } // the start menu or the opening film is up
  function canMove() { return enabled() && !reduceMotion() && !saveData() && !underStart(); }

  // The clip is fetched whole, kept in the phone's offline store and played from memory
  // (a phone asks for video in pieces, which a stored copy can't answer).
  function fetchClip(CLIP) {
    const net = function () { return root.fetch(CLIP).then(function (r) { if (!r.ok) throw new Error("no clip"); return r; }); };
    if (!root.caches) return net();
    return root.caches.open(MEDIA).then(function (c) {
      return c.match(CLIP).then(function (hit) {
        return hit || net().then(function (r) { c.put(CLIP, r.clone()).catch(function () {}); return r; });
      });
    }, net);
  }
  function loadClip() {
    const k = look().clip;
    if (clipUrl[k]) return Promise.resolve(clipUrl[k]);
    if (!clipWait[k]) {
      clipWait[k] = fetchClip(k).then(function (r) { return r.blob(); })
        .then(function (b) { clipUrl[k] = root.URL.createObjectURL(b); return clipUrl[k]; })
        .catch(function () { clipWait[k] = null; return null; });
    }
    return clipWait[k];
  }
  function el(tag, cls) { const n = doc.createElement(tag); if (cls) n.className = cls; return n; }
  function video() {
    const v = el("video");
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.preload = "auto"; v.disablePictureInPicture = true; v.tabIndex = -1;
    v.addEventListener("playing", function () { v.classList.add("on"); });
    return v;
  }
  function still() {
    const i = el("img");
    i.src = look().still; i.alt = ""; i.decoding = "async"; i.setAttribute("aria-hidden", "true");
    i.addEventListener("error", function () { i.remove(); });
    return i;
  }
  function play(v) {
    const p = v.play();
    return p && p.then ? p.then(function () { return true; }, function () { return false; }) : Promise.resolve(true);
  }

  // Home: the picture, with a slow walk over it that fades back to the picture and restarts.
  let home = null;
  function leaveHome() {
    if (!home) return;
    root.clearTimeout(home.timer);
    home.v.pause(); home.v.remove(); home.v.removeAttribute("src"); home.v.load();
    home = null;
  }
  function homeLayer() {
    leaveHome();
    if (!enabled()) return null;
    const box = el("div", "unit-bg " + look().name);
    box.append(still());
    if (canMove()) loadClip().then(function (url) {
      if (!url || !box.isConnected || !canMove() || url !== clipUrl[look().clip]) return;
      const v = video();
      const me = home = { v: v, timer: 0 };
      const start = function () {
        v.playbackRate = 0.5;
        play(v).then(function (ok) { if (!ok && home === me) { leaveHome(); v.remove(); } });
      };
      v.addEventListener("timeupdate", function () {
        if (home !== me || !v.duration || v.currentTime < v.duration - 0.9 || !v.classList.contains("on")) return;
        v.classList.remove("on");
        me.timer = root.setTimeout(function () { if (home === me) { v.currentTime = 0; start(); } }, 900);
      });
      v.src = url; box.append(v); start();
    });
    return box;
  }

  // Practice: one backdrop behind the header (it takes no room, so the answers stay in
  // reach) that lives across cards, so the walk carries on where it stopped.
  let rounds = null;
  function roundsBanner() {
    if (!canMove()) return null;
    if (rounds && rounds.look !== look().name) off(); // day turned to night, or Settings changed
    if (!rounds) {
      const box = el("div", "rounds " + look().name);
      const v = video();
      const me = rounds = { box: box, v: v, ready: false, timer: 0, asked: 0, look: look().name };
      box.append(still(), v);
      // A card that asked to walk a moment ago still gets its step; a late load does not.
      v.addEventListener("loadedmetadata", function () { me.ready = true; if (Date.now() - me.asked < 500) step(); });
    }
    const me = rounds;
    if (!me.v.getAttribute("src")) loadClip().then(function (url) { if (url && rounds === me && !me.v.getAttribute("src")) me.v.src = url; });
    return me.box;
  }
  // Walk one step. Called after the backdrop is back on the page for the next card.
  // If the clip isn't loaded yet this card just keeps the picture: no late movement.
  function step() {
    if (rounds) rounds.asked = rounds.ready ? 0 : Date.now();
    if (!rounds || !rounds.ready || !rounds.box.isConnected || !canMove()) return;
    const v = rounds.v, box = rounds.box, me = rounds;
    root.clearTimeout(me.timer);
    const stop = function () { v.pause(); box.classList.remove("moving"); };
    const go = function () {
      play(v).then(function (ok) {
        if (!ok || rounds !== me) return; // Low Power Mode and the like: stay a still
        box.classList.add("moving");
        me.timer = root.setTimeout(stop, STEP * 1000);
      });
    };
    if (v.duration && v.currentTime + STEP > v.duration + 0.25) {
      // End of the hallway: fade to the picture (the clip's first frame) and start over.
      v.classList.remove("on");
      me.timer = root.setTimeout(function () { v.currentTime = 0; go(); }, 350);
    } else go();
  }
  function restart() { if (rounds && rounds.ready) { rounds.v.pause(); rounds.v.currentTime = 0; } }
  // The Settings switch: take everything off the screen now.
  function off() {
    leaveHome();
    if (rounds) { root.clearTimeout(rounds.timer); rounds.v.pause(); rounds.box.remove(); rounds = null; }
  }
  doc.addEventListener("visibilitychange", function () {
    if (!doc.hidden) { if (home && home.v.isConnected) play(home.v); return; }
    if (home) home.v.pause();
    if (rounds) { root.clearTimeout(rounds.timer); rounds.v.pause(); rounds.box.classList.remove("moving"); }
  });

  root.EKG = root.EKG || {};
  root.EKG.unit = { lookName: lookName, enabled: enabled, canMove: canMove, homeLayer: homeLayer, leaveHome: leaveHome, roundsBanner: roundsBanner, step: step, restart: restart, off: off };
})(window);
