// Run: node tests/run.js   (no dependencies; N=200 for a quick run)
// Checks that generated strips match their answer key, and the quiz logic.
"use strict";
const assert = require("assert");
require("../js/rhythms.js");
require("../js/ecg.js");
require("../js/quiz.js");
require("../js/fsrs.js");
require("../js/evidence.js");
const { rhythms, ecg, quiz, evidence } = globalThis.EKG;

// The Evidence screen says how many strips a full run draws; it must match this default.
const DEFAULT_N = 800;
const N = Number(process.env.N || DEFAULT_N);
let checks = 0;
function ok(cond, msg) { checks++; assert.ok(cond, msg); }
const FEATS = ["reg", "atrial", "pr", "qrs", "ectopy", "shape"];

// Independent R-peak detection straight from the samples (not from the beat list).
function detectPeaks(strip) {
  const x = strip.samples, fs = strip.fs;
  const sorted = Array.from(x).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  let maxAbs = 0;
  for (const v of x) maxAbs = Math.max(maxAbs, Math.abs(v - median));
  const thr = 0.6 * maxAbs, refr = Math.round(0.2 * fs);
  const peaks = [];
  for (let i = 1; i < x.length - 1; i++) {
    const a = Math.abs(x[i] - median);
    if (a > thr && a >= Math.abs(x[i - 1] - median) && a >= Math.abs(x[i + 1] - median)) {
      if (peaks.length && i - peaks[peaks.length - 1] < refr) {
        if (a > Math.abs(x[peaks[peaks.length - 1]] - median)) peaks[peaks.length - 1] = i;
      } else peaks.push(i);
    }
  }
  return peaks.map((i) => i / fs);
}
// Biggest deflection within ±w s of t, measured from the median of the surrounding second.
function localAmp(strip, t, w) {
  const x = strip.samples, fs = strip.fs;
  const a = Math.max(0, Math.round((t - 0.5) * fs)), b = Math.min(x.length, Math.round((t + 0.5) * fs));
  const seg = Array.from(x.slice(a, b)).sort((p, q) => p - q);
  const med = seg[Math.floor(seg.length / 2)];
  let m = 0;
  for (let i = Math.max(0, Math.round((t - w) * fs)); i < Math.min(x.length, Math.round((t + w) * fs)); i++) m = Math.max(m, Math.abs(x[i] - med));
  return m;
}
const UNIFORM = new Set(["sinus", "sarr", "pause", "pac", "svt", "junc", "vent", "fib", "flutter", "wenck", "mobitz2"]);

function checkStrip(R, st, tag) {
  const m = st.measures, k = R.criteria, F = m.feat, kind = R.gen.kind;
  ok(st.samples.length === 6 * st.fs, tag + ": 6 s of samples");
  ok(st.samples.every(Number.isFinite), tag + ": finite samples");
  let lo = Infinity, hi = -Infinity;
  for (const v of st.samples) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  ok(hi - lo <= 3.4, tag + ": fits the 4 mV window (" + (hi - lo).toFixed(2) + ")");

  for (const f of FEATS) ok(k[f].includes(F[f]), tag + ": feature " + f + "=" + F[f] + " in criteria");

  const rate = quiz.readRate(m);
  if (k.rate) {
    ok(rate >= k.rate[0] && rate <= k.rate[1], tag + ": rate " + rate + " in criteria");
    if (F.reg === "regular") ok(m.rateFromBoxes >= k.rate[0] && m.rateFromBoxes <= k.rate[1], tag + ": 1500 rule rate " + m.rateFromBoxes);
  }
  if (F.qrs !== "none") ok(m.count6s >= 3, tag + ": at least 3 beats");
  else ok(m.count6s === 0, tag + ": no QRS");

  // Regularity statistics match the label.
  if (F.reg === "regular") ok(m.rrCV < 0.05, tag + ": regular (CV " + m.rrCV.toFixed(3) + ")");
  if (kind === "fib") ok(m.rrCV >= 0.12 && m.rrMax - m.rrMin >= 0.2, tag + ": AFib irregular");
  if (kind === "flutter" && F.reg === "irregular") ok(m.rrMax - m.rrMin >= 0.15, tag + ": variable flutter R-R spread");
  if (kind === "sarr") ok(m.ppMax - m.ppMin > 0.12, tag + ": sinus arrhythmia P-P varies over 0.12 s");

  // Displayed numbers agree with the categories (never cross a cutoff on screen).
  if (F.qrs === "narrow") ok(m.qrs < 0.12 && Number(m.qrs.toFixed(2)) < 0.12, tag + ": narrow QRS " + m.qrs.toFixed(3));
  if (F.qrs === "wide") ok(m.qrs >= 0.12 && Number(m.qrs.toFixed(2)) >= 0.12, tag + ": wide QRS " + m.qrs.toFixed(3));
  if (m.pvcQrs) ok(m.pvcQrs >= 0.12, tag + ": PVCs wide");
  if (F.pr === "normal") {
    ok(m.pr >= 0.12 && m.pr <= 0.2 && Number(m.pr.toFixed(2)) <= 0.2, tag + ": PR normal " + m.pr.toFixed(3));
    for (const b of st.beats) if (b.p && b.type === "n") ok(b.pr >= 0.12 && b.pr <= 0.2, tag + ": beat PR " + b.pr.toFixed(3));
  }
  if (F.pr === "long") { ok(m.prMin > 0.2 && Number(m.prMin.toFixed(2)) > 0.2, tag + ": PR long " + m.prMin.toFixed(3)); ok(m.prMax - m.prMin < 0.02, tag + ": PR constant"); }
  if (F.pr === "short") ok(m.pr < 0.12, tag + ": short PR");

  // Rhythm-specific checks.
  const conducted = st.beats.filter((b) => b.p).sort((a, b) => a.pOn - b.pOn);
  if (kind === "wenck") {
    ok(m.dropped >= 1, tag + ": a dropped P");
    // Inside each group the PR grows; after each drop it resets shorter.
    for (let i = 1; i < conducted.length; i++) {
      const a = conducted[i - 1], b = conducted[i];
      if (b.idx === a.idx + 1) ok(b.pr > a.pr + 0.01, tag + ": PR lengthens within group");
      if (b.idx === 0 && a.idx > 0) ok(b.pr < a.pr - 0.05, tag + ": PR shorter after the drop");
    }
    ok(m.prLast - m.prFirst >= 0.06, tag + ": visible PR growth");
  }
  if (kind === "mobitz2") {
    ok(m.dropped >= 1, tag + ": a dropped P");
    ok(m.prMax - m.prMin < 0.015, tag + ": PR constant in type II");
    // The pause around a dropped P is two P-P.
    const vis = st.beats.filter((b) => b.r >= 0 && b.r < 6).map((b) => b.r);
    const rr = vis.slice(1).map((r, i) => r - vis[i]);
    const pp = st.info.pp;
    ok(rr.every((x) => Math.abs(x - pp) < 0.05 || Math.abs(x - 2 * pp) < 0.06), tag + ": R-R is one or two P-P");
  }
  if (kind === "third") {
    ok(m.atrialRate > m.rate, tag + ": atrial faster than ventricular");
    ok(m.pqMax - m.pqMin >= 0.12, tag + ": AV dissociation");
  }
  if (kind === "pvc") {
    const pvcs = st.beats.filter((b) => b.type === "pvc" && b.r > 0 && b.r < 6);
    ok(pvcs.length >= 1, tag + ": PVC on strip");
    const ns = st.beats.filter((b) => b.type === "n");
    for (const v of pvcs) {
      const before = ns.filter((b) => b.r < v.r).pop(), after = ns.find((b) => b.r > v.r);
      const prev = st.beats.filter((x) => x.r < v.r).pop();
      if (prev) ok(v.r - prev.r < 0.75 * m.baseRR, tag + ": PVC is early");
      if (before && after && R.gen.pattern !== "couplet") ok(Math.abs(after.r - before.r - 2 * m.baseRR) < 0.12, tag + ": full compensatory pause");
    }
    if (R.gen.pattern === "multi") ok(m.foci >= 2, tag + ": two shapes");
    if (R.gen.pattern === "couplet") ok(pvcs.length === 2, tag + ": exactly one couplet");
    if (R.gen.pattern === "bigeminy") {
      const seq = st.beats.filter((b) => b.r > 0 && b.r < 6).map((b) => b.type);
      for (let i = 1; i < seq.length; i++) ok(seq[i] !== seq[i - 1], tag + ": alternating N/PVC");
    }
    if (R.gen.pattern === "uni") ok(new Set(pvcs.map((b) => b.focus)).size === 1, tag + ": one focus");
  }
  if (kind === "pac") {
    const all = st.beats.slice().sort((a, b) => a.r - b.r);
    for (let i = 1; i < all.length - 1; i++) if (all[i].type === "pac") {
      ok(all[i].r - all[i - 1].r < 0.8 * m.baseRR, tag + ": PAC early");
      ok(all[i + 1].r - all[i - 1].r < 2 * m.baseRR - 0.05, tag + ": not a full compensatory pause");
    }
  }
  if (kind === "flutter") ok(m.flutterRate >= 200 && m.flutterRate <= 400, tag + ": flutter rate");
  if (kind === "vf") { ok(hi - lo >= 0.2, tag + ": VF has visible deflections (" + (hi - lo).toFixed(2) + ")"); }
  if (kind === "asystole") ok(hi - lo < 0.15, tag + ": asystole flat (" + (hi - lo).toFixed(2) + ")");
  if (kind === "torsades") ok(new Set(st.beats.filter((b) => b.r > 0 && b.r < 6).map((b) => b.focus.pol)).size === 2, tag + ": twists");

  // Signal check: every big QRS is visible in the samples.
  const expected = st.beats.filter((b) => b.r >= 0.05 && b.r <= 5.95 && (!b.focus || b.focus.amp >= 0.5));
  for (const b of expected) ok(localAmp(st, b.r, 0.05) >= 0.3, tag + ": beat at " + b.r.toFixed(2) + " s visible");
  if (UNIFORM.has(kind)) {
    const peaks = detectPeaks(st);
    ok(peaks.length <= m.count6s + 1, tag + ": no extra peaks (" + peaks.length + " vs " + m.count6s + ")");
  }

  // Answer key: the true rhythm fits, every other rhythm fails at least once.
  ok(quiz.mismatches(R.id, st).length === 0, tag + ": correct answer has no mismatch: " + quiz.mismatches(R.id, st).join(" | "));
  for (const other of rhythms.list) {
    if (other.id === R.id) continue;
    const why = quiz.mismatches(other.id, st);
    ok(why.length > 0, tag + ": " + other.id + " is ruled out");
    for (const w of why) ok(!/undefined|NaN|null/.test(w), tag + ": clean why-not text: " + w);
  }
  const fi = quiz.findings(st);
  ok(fi.length === 5, tag + ": 5-step findings");
  for (const f of fi) ok(f[1] && !/undefined|NaN|null/.test(f[1]), tag + ": clean finding " + f[0] + ": " + f[1]);
  if (st.edge) ok(quiz.edgeNote(st) && !/undefined|NaN/.test(quiz.edgeNote(st)), tag + ": edge note");
}

// Data sanity.
for (const R of rhythms.list) {
  ok(R.review === "pending" || (R.review === "reviewed" && /^an? [a-z]/.test(R.reviewed.by) && /^[A-Z][a-z]{2} \d{4}$/.test(R.reviewed.date)),
    R.id + ": review is pending, or reviewed with a role and a month (never a name)");
  ok(R.sources.length && R.sources.every((s) => rhythms.sources[s]), R.id + ": sources exist");
  ok(R.lookalikes.every((id) => rhythms.byId[id] && id !== R.id), R.id + ": lookalikes exist");
  for (const f of FEATS) ok(Array.isArray(R.criteria[f]) && R.criteria[f].length, R.id + ": criteria " + f);
  ok(rhythms.groups.some((g) => g.id === R.group), R.id + ": group");
}
ok(rhythms.list.length === 26, "26 rhythms");

// Evidence screen: every number it shows is computed and true.
ok(evidence.TESTS.perRhythm === DEFAULT_N, "Evidence screen strip count matches the full test run");
ok(evidence.strips() === DEFAULT_N * rhythms.list.length, "Evidence total strips");
{
  const st = evidence.refStats(), k = st.kinds;
  const cited = new Set(); rhythms.list.forEach((R) => R.sources.forEach((s) => cited.add(s)));
  ok(st.total === cited.size, "Evidence counts the references the cards cite");
  ok(k.guideline + k.statpearls + k.litfl + k.review + k.other === st.total, "Evidence kinds add up");
  ok(k.other === 0, "every cited reference has a known kind");
  ok(!cited.has("S10") && !["S30", "S31", "S32", "S33"].some((s) => cited.has(s)), "design and waveform sources are not counted as rhythm references");
  const sent = evidence.refSentence(st);
  ok(sent.includes(st.total + " published references") && !/undefined|NaN/.test(sent), "Evidence sentence: " + sent);
  ["S30", "S31", "S32", "S33"].forEach((s) => ok(rhythms.sources[s] && /^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/.test(rhythms.sources[s].url), s + " links to PubMed"));
  const rv = evidence.reviewStats();
  ok(rv.total === 26 && rv.reviewed === rhythms.list.filter((R) => R.review === "reviewed").length, "review count is computed");
  const txt = evidence.reviewText({ nsr: { ok: true, note: "" }, vt: { ok: false, note: "  rate seems slow " }, afib: { ok: null, note: "x" } }, { date: "2026-11-19" });
  ok(txt.includes("Marked 2 of 26.") && txt.includes("- " + rhythms.byId.vt.name + ": rate seems slow") && txt.includes("Not marked yet (24)"), "review text groups marks");
  ok(!/undefined|NaN|null/.test(txt), "review text is clean");
  const empty = evidence.reviewText({}, {});
  ok(empty.includes("Marked 0 of 26.") && empty.includes("Not marked yet (26)"), "empty review text");
}
ok(rhythms.list.filter((r) => r.lethal).map((r) => r.id).sort().join() === "asystole,torsades,vf,vt", "lethal set");

for (const R of rhythms.list) {
  const edges = R.gen.edge ? Object.keys(R.gen.edge) : [];
  const seen = {};
  for (let s = 1; s <= N; s++) {
    const seed = s * 7919 + R.id.length * 104729;
    const borderline = edges.length > 0 && s % 3 === 0;
    const st = ecg.generate(R.id, { seed, borderline });
    checkStrip(R, st, R.id + (borderline ? " edge" : "") + " seed " + seed);
    const key = FEATS.map((f) => st.measures.feat[f]).join("/");
    seen[key] = (seen[key] || 0) + 1;
    if (borderline) ok(st.edge, R.id + ": borderline strip has an edge");
  }
  console.log(R.id.padEnd(9), "ok ·", N, "strips ·", Object.keys(seen).length, "feature variant(s)");
}

// Same seed gives the same strip.
const a = ecg.generate("wenck", { seed: 42 }), b = ecg.generate("wenck", { seed: 42 });
ok(a.samples.every((v, i) => v === b.samples[i]), "deterministic with seed");

// Choices: 4 unique options including the answer, mostly lookalikes.
let r = ecg.makeRand(1).raw;
for (const R of rhythms.list) {
  let look = 0, total = 0;
  for (let i = 0; i < 300; i++) {
    const c = quiz.choices(R.id, r);
    ok(c.length === 4 && new Set(c).size === 4 && c.includes(R.id), "choices for " + R.id);
    c.forEach((id) => { if (id !== R.id) { total++; if (R.lookalikes.includes(id) || rhythms.byId[id].group === R.group) look++; } });
  }
  ok(look / total > 0.8, R.id + ": distractors are mostly lookalikes (" + (look / total).toFixed(2) + ")");
}
// Choices limited to a rhythm set.
const core = rhythms.sets.find((s) => s.id === "core").ids;
for (let i = 0; i < 200; i++) ok(quiz.choices("vt", r, 4, core).every((id) => core.includes(id)), "core set choices stay in set");

// Exam plan: lethal rhythms covered, groups covered, no repeats in a row.
for (const n of [10, 20, 25]) {
  const p = quiz.examPlan(n, r);
  ok(p.length === n, "exam length " + n);
  for (const id of ["vt", "vf", "asystole", "torsades"]) ok(p.includes(id), "exam " + n + " has " + id);
  for (const g of rhythms.groups) ok(p.some((id) => rhythms.byId[id].group === g.id), "exam " + n + " covers " + g.id);
  ok(new Set(p).size === Math.min(n, 26), "exam " + n + " has no needless repeats");
  for (let i = 1; i < p.length; i++) ok(p[i] !== p[i - 1], "no rhythm twice in a row");
  const pc = quiz.examPlan(n, r, core);
  for (const id of core) ok(pc.includes(id), "core exam " + n + " has " + id);
  ok(pc.filter((id) => id === "vt").length >= 2, "core exam " + n + " has VT twice");
}

// Exam scoring, lethal rule and group breakdown.
const res = (okFlags, ids) => okFlags.map((o, i) => ({ rhythm: ids[i], ok: o }));
let sc = quiz.scoreExam(res([true, true, true, true, false], ["nsr", "brady", "tach", "afib", "vf"]), 80, true);
ok(sc.pct === 80 && sc.passScore && !sc.passLethal && !sc.passed, "80% but missed VF fails with lethal rule");
sc = quiz.scoreExam(res([true, true, true, true, false], ["nsr", "brady", "tach", "afib", "asystole"]), 80, false);
ok(sc.passed, "same result passes without lethal rule");
sc = quiz.scoreExam(res([true, false, true, true, true], ["nsr", "wenck", "third", "afib", "vt"]), 85, true);
ok(!sc.passed && sc.passLethal, "80% fails an 85% pass mark");
ok(sc.groups.find((g) => g.id === "blocks").correct === 1 && sc.groups.find((g) => g.id === "blocks").total === 2, "group breakdown");

for (let i = 0; i < 1000; i++) ok(quiz.pickRhythm({ nsr: 0, vt: 1, afib: 2 }, r) !== "nsr", "zero weight never picked");
ok(quiz.boxes(0.10) === "2.5" && quiz.boxes(0.2) === "5", "small boxes shown with one decimal");

// Progress: honest dashboard numbers (accuracy, "not tried yet", recent misses), prefs migration.
{
  const store = { "ekg.prefs.v1": JSON.stringify({ ack: true, exam: { count: 10 } }) };
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  require("../js/progress.js");
  const pg = globalThis.EKG.progress;
  ok(pg.prefs().ack === true && !pg.prefs().tour, "old prefs load; tour defaults to unseen");
  ok(pg.accuracy(["nsr"]).pct === null && pg.accuracy(["nsr"]).n === 0, "no answers: not tried yet, not 0%");
  pg.record("nsr", true, 900, "practice");
  pg.record("vt", false, 1200, "practice");
  pg.record("afib", false, 1500, "exam");
  pg.record("vt", false, 1100, "practice");
  pg.record("nsr", false, 800, "practice");
  ok(pg.accuracy(["nsr"]).pct === 50, "accuracy from real answers");
  ok(pg.accuracy(["nsr", "vt"]).n === 4 && pg.accuracy(["nsr", "vt"]).pct === 25, "group accuracy pools its rhythms");
  ok(JSON.stringify(pg.recentMisses(5)) === JSON.stringify(["nsr", "vt", "afib"]), "recent misses: distinct, newest first");
  for (let i = 0; i < 30; i++) pg.record("vt", true, 700, "practice");
  ok(pg.accuracy(["vt"]).pct === 100 && pg.accuracy(["vt"], 20).n === 20, "accuracy uses the last 20 answers");
  ok(JSON.parse(store["ekg.progress.v2"]).answers.length === 35, "answers saved to ekg.progress.v2");
  pg.reset();
  ok(pg.accuracy(["vt"]).pct === null && pg.recentMisses(5).length === 0, "reset clears dashboard data");
}

// ---------- Step 3: FSRS scheduler matches the reference py-fsrs 6.3.3 ----------
{
  const FS = globalThis.EKG.fsrs, V = require("./fsrs-vectors.json");
  let steps = 0;
  for (const seq of V.seqs) {
    let c = FS.newCard();
    for (const st of seq) {
      c = FS.review(c, st.rating, st.at);
      steps++;
      ok(Math.abs(c.s - st.s) / st.s < 1e-9 && Math.abs(c.d - st.d) < 1e-9, "fsrs stability/difficulty match py-fsrs");
      ok(c.state === st.state && c.step === st.step && c.due === st.due, "fsrs state, step and due match py-fsrs");
      ok(Math.abs(FS.retrievability(c, st.at + 5 * 864e5) - st.r) < 1e-9, "fsrs recall probability matches py-fsrs");
    }
  }
  ok(steps > 300, "fsrs vectors cover " + steps + " reviews");
  ok(FS.retrievability(FS.newCard(), Date.now()) === 0, "unseen card has recall 0");
}

// ---------- Step 3: progress v2, migration, grading, mastery, sessions ----------
function freshProgress(store) {
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  delete require.cache[require.resolve("../js/progress.js")];
  require("../js/progress.js");
  return globalThis.EKG.progress;
}
{
  const D = 864e5, M = 60e3, T0 = Date.UTC(2026, 0, 5, 21, 0);
  // Migration: v1 answers replay into v2 in time order; v1 stays untouched.
  const v1 = { answers: [
    { r: "vt", ok: true, ms: 3000, mode: "practice", at: T0 + 2 * M },
    { r: "nsr", ok: true, ms: 2000, mode: "practice", at: T0 },
    { r: "afib", ok: false, ms: 5000, mode: "exam", at: T0 + M },
    { r: "vt", ok: true, ms: 2500, mode: "practice", at: T0 + 20 * M }
  ], sessions: [{ mode: "exam", total: 1, correct: 0, pct: 0, passed: false, at: T0 + M }], review: { afib: 2 } };
  const store = { "ekg.progress.v1": JSON.stringify(v1) };
  const before = store["ekg.progress.v1"];
  let pg = freshProgress(store);
  ok(store["ekg.progress.v1"] === before, "migration leaves ekg.progress.v1 untouched");
  const v2 = JSON.parse(store["ekg.progress.v2"]);
  ok(v2.v === 2 && v2.answers.length === 4 && v2.sessions.length === 1, "v1 answers and sessions carried into v2");
  ok(v2.answers[0].r === "nsr" && v2.answers[3].at === T0 + 20 * M, "replay in time order");
  ok(pg.migrated() === 4, "migration count reported");
  ok(pg.item("r:vt").reps === 2 && pg.item("r:vt").state === globalThis.EKG.fsrs.REVIEW, "VT: two Goods finish the learning steps");
  ok(pg.item("r:afib").lapses === 1 && pg.item("r:afib").due === T0 + M + 1 * M, "AFib miss: due again in 1 minute");
  ok(pg.accuracy(["nsr", "vt", "afib"]).pct === 75, "accuracy unchanged by migration");
  // A second load reads v2 and does not replay again.
  store["ekg.progress.v1"] = JSON.stringify({ answers: [] });
  pg = freshProgress(store);
  ok(pg.accuracy(["vt"]).n === 2, "v2 loads on its own once written");

  // Grading from the learner's own speed.
  const G = globalThis.EKG.fsrs;
  ok(pg.grade(false, 100, [1, 2, 3, 4, 5]) === G.AGAIN, "wrong = Again");
  ok(pg.grade(true, 9000, [1000, 2000, 3000]) === G.GOOD, "under 5 earlier times = Good");
  const t = [2000, 3000, 4000, 5000, 6000];
  ok(pg.grade(true, 5500, t) === G.HARD && pg.grade(true, 2500, t) === G.EASY && pg.grade(true, 4000, t) === G.GOOD, "Hard/Easy from own 75th/25th percentile");

  // Due, contrast pairs, boundary items.
  pg = freshProgress({});
  pg.record("flutter", false, 4000, "practice", { pick: "afib", shown: ["flutter", "afib", "svt", "tach"], at: T0 });
  ok(pg.item("c:afib|flutter") && pg.item("c:afib|flutter").lapses === 1, "confusion creates a contrast item");
  ok(pg.dueItems(T0).length === 0 && pg.dueItems(T0 + M).indexOf("r:flutter") >= 0, "missed rhythm due after 1 minute");
  ok(pg.reviewIds(T0 + M).sort().join() === "afib,flutter", "due contrast pair brings both rhythms into review");
  pg.record("afib", true, 3000, "practice", { pick: "afib", shown: ["afib", "flutter", "pac", "sarr"], at: T0 + 2 * M });
  ok(pg.item("c:afib|flutter").reps === 2 && pg.item("c:afib|flutter").lapses === 1, "contrast item graded when both were choices");
  pg.record("afib", true, 3000, "practice", { pick: "afib", shown: ["afib", "pac", "sarr", "svt"], at: T0 + 3 * M });
  ok(pg.item("c:afib|flutter").reps === 2, "contrast item not graded when the pair wasn't shown");
  pg.record("brady", true, 3000, "practice", { pick: "brady", shown: ["brady"], edge: "rate", at: T0 + 4 * M });
  ok(pg.item("b:brady") && pg.item("r:brady"), "near-cutoff answer updates boundary and rhythm items");
  ok(JSON.parse(JSON.stringify(pg.pairs(T0 + 60 * M)))[0].id === "c:afib|flutter", "pairs list");
  const w = pg.weights(["nsr", "flutter", "brady"], T0 + 60 * M);
  ok(w.nsr === 7 && w.flutter > w.brady, "weights: new highest, missed above known");
  ok(pg.weakest(["nsr", "flutter", "brady", "afib"], 3, T0 + 60 * M)[0] === "flutter", "weakest: the missed rhythm first");

  // Mastery: correct over weeks earns it; one lucky day doesn't; a miss takes it away.
  pg = freshProgress({});
  let at = T0;
  for (let i = 0; i < 3; i++) { pg.record("vt", true, 3000, "practice", { at: at }); at += 10 * M; }
  ok(!pg.mastery(["vt"], at)[0].mastered, "one good day is not mastery");
  for (const gap of [3, 9, 25, 60]) { at += gap * D; pg.record("vt", true, 3000, "practice", { at: at }); }
  const mv = pg.mastery(["vt"], at)[0];
  ok(mv.mastered && mv.s >= 21 && mv.days >= 3 && mv.r >= 0.9, "repeated recall over weeks = mastered (s " + mv.s.toFixed(1) + " days)");
  ok(!pg.mastery(["vt"], at + 400 * D)[0].mastered, "mastery fades if not reviewed (recall drops under 0.90)");
  ok(pg.groupMastery(["vt", "vf"], at).mastered === 1 && pg.groupMastery(["vt", "vf"], at).score > 0.45, "group mastery weighted by recall");
  pg.record("vt", false, 3000, "practice", { at: at + D });
  ok(!pg.mastery(["vt"], at + D)[0].mastered, "a miss in the last 5 removes mastery");
  ok(pg.likelyToForget(["vt"], 5, at + D).length === 0, "relearning rhythm is not in 'likely to forget'");

  // Trends: practice and exam apart, mastered count per week.
  pg = freshProgress({});
  at = T0;
  for (let i = 0; i < 3; i++) { pg.record("vt", true, 3000, "practice", { at: at }); at += 10 * M; }
  for (const gap of [3, 9, 25, 60]) { at += gap * D; pg.record("vt", true, 3000, "practice", { at: at }); }
  pg.record("nsr", false, 9000, "exam", { at: at + M });
  const tr = pg.trends(["vt", "nsr"], 16, at + 2 * M);
  const lastW = tr[tr.length - 1];
  ok(tr.length === 16 && lastW.exam.n === 1 && lastW.exam.pct === 0 && lastW.practice.n === 1 && lastW.practice.pct === 100, "trends split practice and exam");
  ok(lastW.mastered === 1 && tr[0].mastered === 0 && tr.some((x) => x.mastered === 0 && x.practice.n > 0), "trends count mastered rhythms at each week end");
}

console.log("all", checks, "checks passed");
