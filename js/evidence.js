/* "How this was built" facts and the nurse's review text. Data and plain functions only
   (tested in tests/run.js); the screens are drawn in js/app.js. Every number shown on the
   Evidence screen is computed here from the code, or is a test-run fact that tests/run.js
   checks against itself. Sources: docs/sources.md (S30 to S33 for the design evidence). */
(function (root) {
  "use strict";
  const R = root.EKG.rhythms;

  // Bump VERSION when the screen changes enough to be worth showing once more.
  const VERSION = 1;
  // The full test run: tests/run.js draws perRhythm strips of every rhythm (its default N).
  // lastRun is the date of the last full run that passed; update it after running one.
  const TESTS = { perRhythm: 800, lastRun: "2026-11-19" };

  // What kind of reference each cited source is, from its label in js/rhythms.js.
  function kindOf(label) {
    if (/^LITFL/.test(label)) return "litfl";
    if (/StatPearls/.test(label)) return "statpearls";
    if (/ACC\/AHA/.test(label)) return "guideline";
    if (/PMC review/.test(label)) return "review";
    return "other";
  }
  // References cited by the rhythm cards (not the design evidence or the waveform model).
  function refStats() {
    const ids = new Set();
    R.list.forEach(function (r) { r.sources.forEach(function (s) { ids.add(s); }); });
    const kinds = { guideline: 0, statpearls: 0, litfl: 0, review: 0, other: 0 };
    ids.forEach(function (s) { kinds[kindOf(R.sources[s].label)]++; });
    return { total: ids.size, kinds: kinds };
  }
  function strips() { return TESTS.perRhythm * R.list.length; }
  function reviewStats() {
    const done = R.list.filter(function (r) { return r.review === "reviewed"; });
    const dates = Array.from(new Set(done.map(function (r) { return r.reviewed.date; })));
    return { reviewed: done.length, total: R.list.length, dates: dates };
  }

  // "1 ACC/AHA guideline" / "3 StatPearls chapters": plain counts for the sentence.
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function refSentence(st) {
    const k = st.kinds, parts = [];
    if (k.guideline) parts.push(plural(k.guideline, "ACC/AHA guideline", "ACC/AHA guidelines"));
    if (k.statpearls) parts.push(plural(k.statpearls, "StatPearls chapter", "StatPearls chapters"));
    if (k.review) parts.push(plural(k.review, "peer-reviewed review article", "peer-reviewed review articles"));
    if (k.litfl) parts.push(plural(k.litfl, "LITFL ECG Library page", "LITFL ECG Library pages"));
    if (k.other) parts.push(plural(k.other, "other reference", "other references"));
    const list = parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] : parts.join("");
    return "The criteria on the " + R.list.length + " rhythm cards cite " + st.total + " published references: " + list + ".";
  }

  // The text the nurse copies and sends. Short names, grouped, notes kept as typed.
  function reviewText(marks, opts) {
    opts = opts || {};
    const ok = [], off = [], none = [];
    R.list.forEach(function (r) {
      const m = marks[r.id];
      if (m && m.ok === true) ok.push(r);
      else if (m && m.ok === false) off.push(r);
      else none.push(r);
    });
    const lines = [];
    lines.push("EKG Trainer content review" + (opts.date ? ", " + opts.date : "") + (opts.version ? " (app " + opts.version + ")" : ""));
    lines.push("Marked " + (ok.length + off.length) + " of " + R.list.length + ".");
    lines.push("");
    lines.push("Something's off (" + off.length + "):");
    if (!off.length) lines.push("  none");
    off.forEach(function (r) {
      const note = (marks[r.id].note || "").trim();
      lines.push("- " + r.name + ": " + (note || "(no note)"));
    });
    lines.push("");
    lines.push("Looks right (" + ok.length + "):");
    if (!ok.length) lines.push("  none");
    ok.forEach(function (r) {
      const note = (marks[r.id].note || "").trim();
      lines.push("- " + r.name + (note ? ": " + note : ""));
    });
    if (none.length) {
      lines.push("");
      lines.push("Not marked yet (" + none.length + "): " + none.map(function (r) { return r.short; }).join(", "));
    }
    return lines.join("\n");
  }

  root.EKG = root.EKG || {};
  root.EKG.evidence = { VERSION: VERSION, TESTS: TESTS, refStats: refStats, refSentence: refSentence, strips: strips, reviewStats: reviewStats, reviewText: reviewText, kindOf: kindOf };
})(typeof window !== "undefined" ? window : globalThis);
