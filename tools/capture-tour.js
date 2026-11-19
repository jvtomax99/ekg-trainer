// Dev-only: captures the intro screenshots from the real app (iPhone 13 viewport) and
// saves them as WebP in img/tour/. Not shipped as code, not loaded by the app.
// Run: python3 -m http.server 8765 & node tools/capture-tour.js
// Progress shown in the shots is sample data written to localStorage for the capture.
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");
const OUT = path.join(__dirname, "..", "img", "tour");
const URL = process.env.URL || "http://localhost:8765/";

// Sample answers: most groups practiced, one untried, a few misses in review.
function sample() {
  const plan = { nsr: [1, 1, 1, 1], brady: [1, 1, 0, 1], tach: [1, 1, 1], afib: [1, 0, 1, 1, 1], flutter: [1, 1, 0],
    svt: [1, 1], pac: [0, 1], vt: [1, 1, 1, 0, 1], vf: [1, 1], asystole: [1], torsades: [0, 1], bigeminy: [1, 1, 1],
    first: [1, 1, 0], wenck: [0, 1, 0], mobitz2: [0, 1], third: [1, 1, 1] };
  const answers = [];
  let t = Date.now() - 3 * 864e5;
  Object.keys(plan).forEach(function (r) { plan[r].forEach(function (ok) { answers.push({ r: r, ok: !!ok, ms: 4000 + (answers.length * 977) % 9000, mode: "practice", at: (t += 9e5) }); }); });
  return { answers: answers, sessions: [], review: { wenck: 2, mobitz2: 1 } };
}

async function webp(page, png, file) {
  const data = await page.evaluate(async function (b64) {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    return c.toDataURL("image/webp", 0.78).split(",")[1];
  }, png.toString("base64"));
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data, "base64"));
  console.log("wrote img/tour/" + file, Math.round(Buffer.from(data, "base64").length / 1024) + " KB");
}

(async function () {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext(Object.assign({}, devices["iPhone 13"], { deviceScaleFactor: 2, serviceWorkers: "block", colorScheme: "light" }));
  await ctx.addInitScript(function (p) {
    localStorage.setItem("ekg.progress.v1", JSON.stringify(p));
    localStorage.setItem("ekg.prefs.v1", JSON.stringify({ ack: true, tour: 99, film: "off", exam: { count: 20, seconds: 45, passMark: 85, lethal: true, showTimer: true } }));
  }, sample());
  const page = await ctx.newPage();
  const conv = await browser.newPage();
  const snap = async function (file) { await page.waitForTimeout(900); await webp(conv, await page.screenshot(), file); };

  await page.goto(URL);
  await page.evaluate(function () {
    const g = window.EKG.ecg.generate;
    window.EKG.ecg.generate = function () { const s = g.apply(this, arguments); window.__last = s; return s; };
  });
  await page.waitForTimeout(6300); // let the monitor sweep fill the screen
  await snap("home.webp");

  await page.click('.tabs [data-view="learn"]');
  await snap("learn.webp");

  // Practice: calipers on two consecutive R waves, then the right answer and its feedback.
  await page.click('.tabs [data-view="practice"]');
  await page.selectOption(".select", "core");
  await page.waitForTimeout(200);
  await page.click('#view-practice .strip-tools button:has-text("Measure")');
  await page.waitForTimeout(200);
  const pos = await page.evaluate(function () {
    const s = window.__last, cv = document.querySelector("#view-practice canvas"), r = cv.getBoundingClientRect();
    const rs = s.beats.map(function (b) { return b.r; }).filter(function (t) { return t > 0.5 && t < s.seconds - 0.3; });
    const x = function (t) { return r.left + (0.4 + t) * 25 * cv._geo.pxmm; };
    return { y: r.top + r.height / 2, a: x(rs[0]), b: x(rs[1]), id: s.rhythm };
  });
  await page.mouse.click(pos.a, pos.y);
  await page.mouse.click(pos.b, pos.y);
  await page.click('#view-practice .choice[data-id="' + pos.id + '"]');
  await page.evaluate(function () {
    const card = document.querySelector("#view-practice .card.flush");
    window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 64);
  });
  await snap("practice.webp");

  await page.click('.tabs [data-view="exam"]');
  await page.click('#view-exam .btn.primary');
  await page.waitForTimeout(3200);
  await snap("exam.webp");
  page.once("dialog", function (d) { d.accept(); });
  await page.click('#view-exam button:has-text("Quit")');

  await page.click('.tabs [data-view="progress"]');
  await snap("progress.webp");
  await browser.close();
})();
