// Campus preview checks (step 5). Dev-only. Serve the repo first:
//   python3 -m http.server 8765
//   node tools/campus-check.js [http://localhost:8765/]
// Checks: the trainer requests nothing from campus/; the trainer opens offline with the
// campus never opened; the campus opens offline after one online visit; tapping the three
// priority buildings shows their names; the triangle count is inside the budget.
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:8765/";
const fails = [];
const ok = (cond, msg) => { console.log((cond ? "ok   " : "FAIL ") + msg); if (!cond) fails.push(msg); };

(async () => {
  // SwiftShader gives headless Chromium WebGL; a phone uses its GPU.
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errors = [];
  const campusHits = [];
  ctx.on("request", (r) => { if (r.url().includes("/campus/")) campusHits.push(r.url()); });

  // 1. The trainer alone: no campus request, service worker installed.
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(BASE + "index.html?start=0");
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload(); await p.waitForTimeout(800);
  ok(campusHits.length === 0, "trainer requests nothing from campus/ (" + campusHits.length + ")");
  ok(await p.getAttribute("#campusLink", "href") === "campus/", "About has the Campus preview link");

  // 2. Offline, campus never opened: the trainer still opens.
  await ctx.setOffline(true);
  await p.reload(); await p.waitForTimeout(800);
  ok(await p.isVisible("#view-home"), "trainer opens offline with the campus never opened");
  await ctx.setOffline(false);

  // 3. Campus online once, then offline.
  await p.goto(BASE + "campus/");
  await p.waitForFunction(() => window.__campus, null, { timeout: 30000 });
  ok(true, "campus opens online");
  await p.waitForTimeout(1500); // let the service worker store the files
  await ctx.setOffline(true);
  await p.reload();
  const offlineOK = await p.waitForFunction(() => window.__campus, null, { timeout: 30000 }).then(() => true, () => false);
  ok(offlineOK, "campus opens offline after one online visit");
  await ctx.setOffline(false);

  // 4. Taps and budget.
  const names = { main_rest: "Main hospital", south_block: "South tower of the main hospital", new_tower: "Helena Theurer Pavilion" };
  for (const id of Object.keys(names)) {
    if (await p.isVisible("#campusCard")) await p.click("#cardClose");
    const pt = await p.evaluate((i) => window.__campus.screenOf(i), id);
    if (!pt) { ok(false, "tap " + id + ": not on screen"); continue; }
    await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(200);
    const got = await p.textContent("#cardName");
    ok(got === names[id], "tap " + id + " shows \"" + got + "\"");
  }
  const tris = await p.evaluate(() => window.__campus.triangles());
  ok(tris < 150000, "triangles " + tris + " (budget 150,000)");
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= 390, "no horizontal scroll at 390 px (" + sw + ")");
  ok(errors.length === 0, "no script errors" + (errors.length ? ": " + errors.join(" | ") : ""));

  await browser.close();
  console.log(fails.length ? fails.length + " failed" : "all passed");
  process.exit(fails.length ? 1 : 0);
})();
