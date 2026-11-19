/* Progress and prefs in localStorage. Versioned keys; bump + migrate if shapes change.
   ekg.progress.v2 = { v: 2, answers: [{ r, ok, ms, mode, at, pick, edge }], sessions: [...],
                       items: { id: item } }
     item ids: "r:<rhythm>" recognize it, "b:<rhythm>" on a near-cutoff strip,
               "c:<a>|<b>" tell a confused pair apart (a < b).
     item = FSRS card (js/fsrs.js) + { reps, lapses, hist: last 5 ok flags,
               okDays: recent distinct days with a correct answer, lastOkG: grade of last correct }
   ekg.progress.v1 (old) is read once, replayed into v2 in time order, and left untouched.
   ekg.prefs.v1    = { ack, tour, theme, strip, unit, exam: { count, seconds, passMark, lethal, showTimer, set, edge } } */
(function (root) {
  "use strict";
  const F = root.EKG.fsrs;
  const PKEY = "ekg.progress.v2", OLD = "ekg.progress.v1", FKEY = "ekg.prefs.v1";
  const MAX_ANSWERS = 5000, MAX_SESSIONS = 200, SPEED_N = 20;
  const DAY = F.DAY;

  function readRaw(key) {
    try { const raw = root.localStorage && root.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function write(key, val) {
    try { root.localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  // ---------- grading and item updates (shared by live answers and replay) ----------
  const emptyState = function () { return { v: 2, answers: [], sessions: [], items: {} }; };
  function dayKey(t) { const d = new Date(t); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function pairId(a, b) { return "c:" + (a < b ? a + "|" + b : b + "|" + a); }
  function quantile(sorted, q) {
    const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }
  // Wrong = Again. Correct: Hard if slower than the learner's own 75th percentile on this
  // rhythm in this mode, Easy if faster than the 25th, else Good. Needs 5 earlier times.
  function grade(ok, ms, times) {
    if (!ok) return F.AGAIN;
    if (!times || times.length < 5) return F.GOOD;
    const s = times.slice().sort(function (a, b) { return a - b; });
    if (ms > quantile(s, 0.75)) return F.HARD;
    if (ms < quantile(s, 0.25)) return F.EASY;
    return F.GOOD;
  }
  function touch(items, id, g, ok, at) {
    const it = items[id] || Object.assign(F.newCard(), { reps: 0, lapses: 0, hist: [], okDays: [], lastOkG: null });
    const c = F.review(it, g, at);
    c.reps = (it.reps || 0) + 1;
    c.lapses = (it.lapses || 0) + (ok ? 0 : 1);
    c.hist = (it.hist || []).concat([ok]).slice(-5);
    c.okDays = (it.okDays || []).slice();
    if (ok) {
      const k = dayKey(at);
      if (c.okDays.indexOf(k) < 0) c.okDays = c.okDays.concat([k]).slice(-5);
      c.lastOkG = g;
    } else c.lastOkG = it.lastOkG == null ? null : it.lastOkG;
    items[id] = c;
  }
  // speed = { "rhythm|mode": [recent correct ms] }, kept alongside the state.
  function apply(st, speed, a) {
    const key = a.r + "|" + a.mode;
    const g = grade(a.ok, a.ms, speed[key]);
    touch(st.items, "r:" + a.r, g, a.ok, a.at);
    if (a.edge) touch(st.items, "b:" + a.r, g, a.ok, a.at);
    if (!a.ok && a.pick && a.pick !== a.r) touch(st.items, pairId(a.r, a.pick), F.AGAIN, false, a.at);
    else if (a.ok && a.shown) {
      a.shown.forEach(function (x) { if (x !== a.r && st.items[pairId(a.r, x)]) touch(st.items, pairId(a.r, x), g, true, a.at); });
    }
    if (a.ok) speed[key] = (speed[key] || []).concat([a.ms]).slice(-SPEED_N);
    return g;
  }
  function speedFrom(answers) {
    const sp = {};
    answers.forEach(function (a) { if (a.ok) { const k = a.r + "|" + a.mode; (sp[k] = sp[k] || []).push(a.ms); } });
    Object.keys(sp).forEach(function (k) { sp[k] = sp[k].slice(-SPEED_N); });
    return sp;
  }
  // Rebuild items from answers in time order. onStep(st, nextAt) runs before each answer.
  function replay(answers, onStep) {
    const st = emptyState(), sp = {};
    answers.slice().sort(function (a, b) { return a.at - b.at; }).forEach(function (a) {
      if (onStep) onStep(st, a.at);
      apply(st, sp, a);
      st.answers.push(a);
    });
    return st;
  }

  // ---------- load, migrate, save ----------
  function load() {
    const v2 = readRaw(PKEY);
    if (v2 && v2.v === 2 && Array.isArray(v2.answers)) {
      return { answers: v2.answers, sessions: v2.sessions || [], items: v2.items || {}, v: 2 };
    }
    const v1 = readRaw(OLD);
    if (v1 && Array.isArray(v1.answers)) {
      const st = replay(v1.answers.filter(function (a) { return a && a.r && typeof a.at === "number"; }));
      st.sessions = Array.isArray(v1.sessions) ? v1.sessions : [];
      st.migrated = v1.answers.length;
      write(PKEY, st);
      return st;
    }
    return emptyState();
  }
  let P = load(), SP = speedFrom(P.answers);
  const prefsDefault = function () { return { ack: false, exam: { count: 20, seconds: 45, passMark: 85, lethal: true, showTimer: true } }; };
  let Fp = Object.assign(prefsDefault(), readRaw(FKEY) || {});

  function save() {
    if (P.answers.length > MAX_ANSWERS) P.answers = P.answers.slice(-MAX_ANSWERS);
    if (P.sessions.length > MAX_SESSIONS) P.sessions = P.sessions.slice(-MAX_SESSIONS);
    write(PKEY, P);
  }

  // extra: { pick, shown, edge, at } (all optional). Returns the grade given.
  function record(rhythm, ok, ms, mode, extra) {
    extra = extra || {};
    const a = { r: rhythm, ok: !!ok, ms: Math.round(ms), mode: mode, at: extra.at || Date.now() };
    if (extra.pick !== undefined) a.pick = extra.pick;
    if (extra.edge) a.edge = extra.edge;
    const g = apply(P, SP, Object.assign({ shown: extra.shown }, a));
    P.answers.push(a);
    save();
    return g;
  }
  function addSession(s) { P.sessions.push(Object.assign({ at: Date.now() }, s)); save(); }

  // ---------- reading the model ----------
  function item(id) { return P.items[id] || null; }
  function recall(id, now) { const it = P.items[id]; return it ? F.retrievability(it, now || Date.now()) : null; }
  function isMastered(it, now) {
    if (!it || it.s == null) return false;
    return F.retrievability(it, now) >= 0.9 && it.s >= 21 && (it.okDays || []).length >= 3 &&
      it.lastOkG !== F.HARD && (it.hist || []).indexOf(false) < 0;
  }
  function rhythmsOf(id) { return id.slice(2).split("|"); }

  // Items due at `now`, most overdue first. kinds: any of "r", "b", "c".
  function dueItems(now, kinds) {
    now = now || Date.now();
    return Object.keys(P.items).filter(function (id) {
      const it = P.items[id];
      return it.due != null && it.due <= now && (!kinds || kinds.indexOf(id[0]) >= 0);
    }).sort(function (a, b) { return P.items[a].due - P.items[b].due; });
  }
  function reviewIds(now) {
    const out = [];
    dueItems(now).forEach(function (id) { rhythmsOf(id).forEach(function (r) { if (out.indexOf(r) < 0) out.push(r); }); });
    return out;
  }
  function lastOk(id) {
    for (let i = P.answers.length - 1; i >= 0; i--) if (P.answers[i].r === id) return P.answers[i].ok;
    return null;
  }

  // Free-practice weights: new, due, recently missed and low-recall rhythms come up more.
  function weights(ids, now) {
    now = now || Date.now();
    const w = {};
    ids.forEach(function (id) {
      const it = P.items["r:" + id];
      if (!it) { w[id] = 7; return; }
      w[id] = 1 + 4 * (1 - F.retrievability(it, now)) + (it.due <= now ? 4 : 0) + (lastOk(id) === false ? 2 : 0);
    });
    return w;
  }

  function missRate(id, n) {
    const mine = [];
    for (let i = P.answers.length - 1; i >= 0 && mine.length < (n || 10); i--) if (P.answers[i].r === id) mine.push(P.answers[i].ok);
    return mine.length ? mine.filter(function (x) { return !x; }).length / mine.length : null;
  }
  // Seen rhythms ranked weakest first (recent misses, low recall, lapse share).
  function weakest(ids, n, now) {
    now = now || Date.now();
    return ids.filter(function (id) { return P.items["r:" + id]; }).map(function (id) {
      const it = P.items["r:" + id];
      return { id: id, score: 2 * missRate(id, 10) + (1 - F.retrievability(it, now)) + it.lapses / it.reps };
    }).filter(function (x) { return x.score > 0.05; }).sort(function (a, b) { return b.score - a.score; }).slice(0, n || 3).map(function (x) { return x.id; });
  }
  // Rhythms in long-term review with the lowest recall probability now.
  function likelyToForget(ids, n, now) {
    now = now || Date.now();
    return ids.filter(function (id) { const it = P.items["r:" + id]; return it && it.state === F.REVIEW; })
      .map(function (id) { return { id: id, r: F.retrievability(P.items["r:" + id], now) }; })
      .sort(function (a, b) { return a.r - b.r; }).slice(0, n || 5).map(function (x) { return x.id; });
  }
  // Confused pairs, the ones needing work first: due, then lowest recall, then most lapses.
  function pairs(now) {
    now = now || Date.now();
    return Object.keys(P.items).filter(function (id) { return id[0] === "c"; }).map(function (id) {
      const it = P.items[id];
      return { id: id, a: rhythmsOf(id)[0], b: rhythmsOf(id)[1], due: it.due <= now, r: F.retrievability(it, now), lapses: it.lapses, reps: it.reps };
    }).sort(function (x, y) { return (y.due - x.due) || (x.r - y.r) || (y.lapses - x.lapses); });
  }

  function mastery(ids, now) {
    now = now || Date.now();
    return ids.map(function (id) {
      const it = P.items["r:" + id];
      return {
        id: id, seen: !!it, mastered: isMastered(it, now),
        r: it ? F.retrievability(it, now) : null, s: it ? it.s : null, due: it ? it.due : null,
        reps: it ? it.reps : 0, lapses: it ? it.lapses : 0, days: it ? (it.okDays || []).length : 0,
        learning: !!it && it.state !== F.REVIEW
      };
    });
  }
  // Share of the group mastered, weighted by recall probability (0 to 1).
  function groupMastery(ids, now) {
    const m = mastery(ids, now);
    return { n: m.length, mastered: m.filter(function (x) { return x.mastered; }).length, seen: m.filter(function (x) { return x.seen; }).length,
      score: m.length ? m.reduce(function (s, x) { return s + (x.mastered ? x.r : 0); }, 0) / m.length : 0 };
  }

  // Weekly buckets, oldest first: practice and exam apart, plus rhythms mastered at week end.
  function trends(ids, weeks, now) {
    now = now || Date.now();
    weeks = weeks || 8;
    const ends = [];
    for (let k = weeks - 1; k >= 0; k--) ends.push(now - k * 7 * DAY);
    const mastered = [];
    let bi = 0;
    const snap = function (st, upto) {
      while (bi < ends.length && ends[bi] <= upto) {
        mastered[bi] = ids.filter(function (id) { return isMastered(st.items["r:" + id], ends[bi]); }).length;
        bi++;
      }
    };
    const st = replay(P.answers, function (s, at) { snap(s, at); });
    snap(st, Infinity);
    const sum = function (arr) {
      const ok = arr.filter(function (a) { return a.ok; });
      return { n: arr.length, pct: arr.length ? Math.round((ok.length / arr.length) * 100) : null,
        avgMs: ok.length ? ok.reduce(function (s, a) { return s + a.ms; }, 0) / ok.length : null };
    };
    return ends.map(function (end, i) {
      const start = end - 7 * DAY;
      const inWeek = P.answers.filter(function (a) { return a.at > start && a.at <= end; });
      return { start: start, end: end, practice: sum(inWeek.filter(function (a) { return a.mode !== "exam"; })),
        exam: sum(inWeek.filter(function (a) { return a.mode === "exam"; })), mastered: mastered[i] || 0 };
    });
  }

  function stats(ids) {
    const per = ids.map(function (id) {
      const all = P.answers.filter(function (a) { return a.r === id; });
      const recent = all.slice(-20);
      const right = recent.filter(function (a) { return a.ok; });
      return {
        id: id,
        attempts: all.length,
        pct: recent.length ? Math.round((right.length / recent.length) * 100) : null,
        avgMs: right.length ? right.reduce(function (s, a) { return s + a.ms; }, 0) / right.length : null,
        inReview: reviewIds().indexOf(id) >= 0
      };
    });
    const weekAgo = Date.now() - 7 * DAY;
    const pct = function (arr) { return arr.length ? Math.round((arr.filter(function (a) { return a.ok; }).length / arr.length) * 100) : null; };
    const thisWeek = P.answers.filter(function (a) { return a.at >= weekAgo; });
    const before = P.answers.filter(function (a) { return a.at < weekAgo; });
    const okTimes = thisWeek.filter(function (a) { return a.ok; });
    return {
      per: per,
      total: P.answers.length,
      overall: pct(P.answers),
      week: pct(thisWeek),
      weekCount: thisWeek.length,
      before: pct(before),
      beforeCount: before.length,
      weekAvgMs: okTimes.length ? okTimes.reduce(function (s, a) { return s + a.ms; }, 0) / okTimes.length : null,
      exams: P.sessions.filter(function (s) { return s.mode === "exam"; }).slice(-10).reverse()
    };
  }

  // Accuracy over the most recent `last` answers for any of `ids` (practice and exam).
  // pct is null when nothing has been answered yet ("not tried yet", never 0%).
  function accuracy(ids, last) {
    const set = {};
    ids.forEach(function (id) { set[id] = true; });
    const mine = P.answers.filter(function (a) { return set[a.r]; });
    const recent = mine.slice(-(last || 20));
    const right = recent.filter(function (a) { return a.ok; }).length;
    return { n: recent.length, attempts: mine.length, right: right, pct: recent.length ? Math.round((right / recent.length) * 100) : null };
  }

  // Distinct rhythms missed most recently, newest first.
  function recentMisses(n) {
    const out = [];
    for (let i = P.answers.length - 1; i >= 0 && out.length < n; i--) {
      const a = P.answers[i];
      if (!a.ok && out.indexOf(a.r) < 0) out.push(a.r);
    }
    return out;
  }

  function reset() { P = emptyState(); SP = {}; save(); }

  root.EKG = root.EKG || {};
  root.EKG.progress = {
    record: record, addSession: addSession, accuracy: accuracy, recentMisses: recentMisses, reviewIds: reviewIds,
    weights: weights, stats: stats, reset: reset, item: item, recall: recall, dueItems: dueItems, weakest: weakest,
    likelyToForget: likelyToForget, pairs: pairs, mastery: mastery, groupMastery: groupMastery, trends: trends,
    grade: grade, migrated: function () { return P.migrated || 0; },
    prefs: function () { return Fp; },
    savePrefs: function (f) { Fp = f; write(FKEY, Fp); }
  };
})(typeof window !== "undefined" ? window : globalThis);
