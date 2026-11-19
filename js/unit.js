/* Night unit backdrop (step 3b, docs/phases/5-night-unit-start.md).
   A generated picture of a generic unit at night behind Home's start card, and "Rounds":
   a hallway clip that moves about one second between practice cards, then holds still.
   Optional in every way: the picture is precached, the clip is fetched after the app is
   open and the app works the same if it never arrives. Never used in Exam. */
(function (root) {
  "use strict";
  const doc = root.document;
  const STILL = "img/unit/unit.webp";
  const CLIP = "img/unit/walk.mp4";
  const STEP = 1; // seconds of walking per card
  let clipUrl = null, clipWait = null;

  function prefs() { return root.EKG.progress.prefs(); }
  function enabled() { return prefs().unit !== "off"; }
  function reduceMotion() { return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function saveData() { const c = root.navigator && root.navigator.connection; return !!(c && c.saveData); }
  function canMove() { return enabled() && !reduceMotion() && !saveData(); }

  // The clip is fetched whole and played from memory, so the offline cache can serve it
  // (a phone asks for video in pieces, which a cached copy can't answer).
  function loadClip() {
    if (clipUrl) return Promise.resolve(clipUrl);
    if (!clipWait) {
      clipWait = root.fetch(CLIP).then(function (r) {
        if (!r.ok) throw new Error("no clip");
        return r.blob();
      }).then(function (b) { clipUrl = root.URL.createObjectURL(b); return clipUrl; })
        .catch(function () { clipWait = null; return null; });
    }
    return clipWait;
  }
  function el(tag, cls) { const n = doc.createElement(tag); if (cls) n.className = cls; return n; }
  function video() {
    const v = el("video");
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.preload = "auto"; v.disablePictureInPicture = true; v.tabIndex = -1;
    return v;
  }
  function still() {
    const i = el("img");
    i.src = STILL; i.alt = ""; i.decoding = "async"; i.setAttribute("aria-hidden", "true");
    i.addEventListener("error", function () { i.remove(); });
    return i;
  }

  // Home: the picture, with a slow walk over it that fades back to the picture and restarts.
  function homeLayer() {
    if (!enabled()) return null;
    const box = el("div", "unit-bg");
    box.append(still());
    if (canMove()) loadClip().then(function (url) {
      if (!url || !box.isConnected) return;
      const v = video();
      v.src = url; v.playbackRate = 0.5;
      v.addEventListener("loadeddata", function () {
        if (!box.isConnected) return;
        v.playbackRate = 0.5; box.append(v);
        const p = v.play(); if (p && p.catch) p.catch(function () { v.remove(); });
        root.requestAnimationFrame(function () { v.classList.add("on"); });
      });
      v.addEventListener("timeupdate", function () {
        if (!box.isConnected) { v.pause(); return; }
        if (v.duration && v.currentTime > v.duration - 0.9 && v.classList.contains("on")) {
          v.classList.remove("on");
          root.setTimeout(function () {
            if (!box.isConnected) return;
            v.currentTime = 0; v.playbackRate = 0.5;
            const p = v.play(); if (p && p.catch) p.catch(function () {});
            v.classList.add("on");
          }, 900);
        }
      });
    });
    return box;
  }

  // Practice: one backdrop behind the header (it takes no room, so the answers stay in
  // reach) that lives across cards, so the walk carries on where it stopped.
  let rounds = null;
  function roundsBanner() {
    if (!canMove()) return null;
    if (!rounds) {
      const box = el("div", "rounds");
      const v = video();
      box.append(still(), v);
      rounds = { box: box, v: v, ready: false, timer: 0 };
      loadClip().then(function (url) {
        if (!url) return;
        v.addEventListener("loadeddata", function () { rounds.ready = true; v.classList.add("on"); step(); });
        v.src = url;
      });
    }
    return rounds.box;
  }
  // Walk one step. Called after the banner is back on the page for the next card.
  function step() {
    if (!rounds || !rounds.ready || !rounds.box.isConnected || !canMove()) return;
    const v = rounds.v, box = rounds.box;
    root.clearTimeout(rounds.timer);
    const go = function () {
      box.classList.add("moving");
      const p = v.play(); if (p && p.catch) p.catch(function () {});
      rounds.timer = root.setTimeout(function () { v.pause(); box.classList.remove("moving"); }, STEP * 1000);
    };
    if (v.duration && v.currentTime + STEP > v.duration + 0.02) {
      // End of the hallway: fade to the picture (the clip's first frame) and start over.
      v.classList.remove("on");
      rounds.timer = root.setTimeout(function () { v.currentTime = 0; v.classList.add("on"); go(); }, 350);
    } else go();
  }
  function restart() { if (rounds && rounds.ready) { rounds.v.pause(); rounds.v.currentTime = 0; } }

  root.EKG = root.EKG || {};
  root.EKG.unit = { enabled: enabled, canMove: canMove, homeLayer: homeLayer, roundsBanner: roundsBanner, step: step, restart: restart };
})(window);
