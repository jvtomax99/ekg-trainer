# Phase 3: Premium UI, app icon, dashboard, onboarding

Owner request 2026-11-19, after testing phase 2 live on a real iPhone: "functionality is
promising, elevate the experience substantially." Goal: a visually extraordinary,
sophisticated iPhone app, not a functioning quiz website. Preserve everything that works
(26 rhythms, exam, sources, future-feature docs). Don't restart the project.

## New delivery order (owner)
1. Custom app icon and cohesive icon system.
2. Premium interface and home dashboard.
3. Short, polished, skippable first-launch onboarding (iPhone only, with Replay).
4. Adaptive learning and mastery visualization (`docs/future/adaptive-learning.md`).
5. Accurate 3D HUMC campus (`docs/future/3d-campus.md`), optional lazy module.
6. Cinematic intro video, 30 to 45 s (`docs/future/cinematic-intro.md`).
7. Final integrated iPhone QA.
Substantial features go on their own branches. Keep improving clinical accuracy throughout.

## 3a. App icon
- Starting point: the icon concept in `DESIGN.md` (near-black, luminous monitor-green
  trace, faint dark red grid). Refine it professionally.
- Real P-QRS-T morphology, readable at Home Screen size, no lettering, no HMH branding.
- Assets: apple-touch-icon 180, PWA 192 and 512 (plus maskable 512 with safe zone),
  favicon (SVG + 32 PNG). Manifest and `<head>` updated. Verify standalone launch, icon
  resolution and safe cropping. Never a screenshot of the site.
- Plan: draw it as an SVG master in code (exact waveform, crisp, versioned), render PNGs
  with the installed Chromium. AI image tools give inconsistent, uneditable raster art.

## 3b. Icon system and design language
- One custom SVG icon set, same stroke width, grid and corner style, inline sprite (no
  icon libraries, no emojis, works offline): Learn, Practice, Exam, Progress, Campus,
  each rhythm group (sinus, atrial, junctional, ventricular, AV blocks), measure, zoom,
  timer, review/missed, mastery, achievement, lethal, sources, settings/about, monitor.
- Design tokens extended in `DESIGN.md`: type scale, spacing, radii, elevation, motion
  durations and easings. Monitor-inspired, not an outdated device.
- Buttons, cards, menus, segmented controls, progress rings and bars restyled.
- Micro-animations: tab and view transitions, answer feedback (correct pulse, wrong
  shake), progress ring fill, haptic-style press states. All respect reduced motion.
- iPhone: 44 px targets, safe areas, one-handed bottom nav, contrast 4.5:1, Dynamic-ish
  type sizes, VoiceOver labels on every icon button.

## 3c. Home dashboard (new first tab)
- Animated monitor-style waveform header.
- Continue studying (big primary action), today's recommended practice, recently missed
  rhythms, per-group progress rings, shortcuts to Learn / Practice / Exam.
- Honest data only: until step 4 exists, show accuracy from real answers and label it
  "accuracy", never "mastery". Unseen rhythms read "not tried yet", not 0%.
- Campus preview slot appears only when the campus exists.

## 3d. Onboarding
- 6 to 8 swipeable cards using real screenshots of this app: purpose, Learn / Practice /
  Exam / Progress, the 5-step method, timed exam and "why not" explanations, Measure and
  Zoom, missed-rhythm review, accuracy now vs mastery later, Add to Home Screen in Safari.
- Skip on every card, Replay from About. iPhone only.
- Credibility, honestly: source-referenced criteria, randomized strips, explanations from
  the strip itself, structured practice. Say clearly: not clinically validated, not
  endorsed, not a copy of any exam, content pending nurse review.
- Replaces the current welcome dialog; keeps its disclaimer.

## What this phase will NOT do
- Adaptive learning, campus, video (later steps above).
- Any framework, build step or web font (system fonts stay; SF Pro on iPhone).
- HMH logos or branding.

## Revision (owner, 2026-11-19, after the first 2b build)
Light day mode plus dark night mode with a user choice (System default); healthcare-tech
shell inspired by modern hospital UI without HMH branding; strip themes separate from the
app theme (paper, green monitor, amber monitor); orange as a restrained accent; refined
effects. Built on the same branch, keeping all earlier 2b work.

## How similar apps do it (looked at before building)
- Duolingo-style home: one big "continue" button plus streaks and leagues. Clear next step,
  but streak pressure is the wrong signal for someone with test anxiety. This app keeps the
  big button and drops the streaks.
- Anki: honest "due today" counts, no judgment, but a dated look and no guidance on *what*
  to study. This app shows a single suggestion and says why ("your lowest group: 58% over
  your last 20 answers").
- Apple Fitness rings: instantly readable progress. Used here per rhythm group, but labeled
  "accuracy" (not mastery), and an untried group shows a dashed ring and "not tried yet".
- The nurse drills in `docs/research.md` (SkillStat, Practical Clinical Skills, Arrhythmia)
  open straight into a quiz with no intro. The intro here is short, skippable, uses real
  screenshots, and states the limits plainly.

## Status (step 2b, built 2026-11-19 on branch `step-2b-premium-ui`)
- 3a icon: done. `tools/make-icons.js`; manifest has 192, 512, maskable 512 and SVG;
  `<head>` has apple-touch-icon, SVG and 32 px favicons. Checked at 512, 60 pt, 40, 32 and
  16 px, iOS rounded mask and Android circle crop (complex inside the safe zone).
- 3b icons and design language: done. 30-icon sprite, tokens in `DESIGN.md`, restyled
  cards, buttons, segmented controls, choices, tags, tables, sheets. Micro-animations:
  view entrance, correct pulse, wrong shake, press scale, ring and bar fill; all off under
  reduced motion. Strip: thicker trace, bigger labels, tighter side padding, new
  Full screen button that turns the strip sideways along the long edge (view only, no
  calipers there).
- 3c Home: done. Monitor header (live sweep, HR column), Continue studying, Suggested next
  with its reason, Recently missed chips (open the rhythm's Learn card), accuracy rings per
  group (last 20 answers), shortcuts, last exam, honest note that mastery isn't built.
- 3d intro: done. `js/tour.js`, 8 cards, 5 real screenshots captured from the app by
  `tools/capture-tour.js` (sample progress data, WebP, 31 to 70 KB each), Skip on every
  card, swipe or Next, Replay from About, Escape closes. Shown once per intro version
  (`tour` field in `ekg.prefs.v1`, additive), so existing users see it once too.
  Replaces the welcome dialog; the disclaimer moved to card 1 and About.
- Verified in Chromium (Playwright) at iPhone 13 (390x844) and iPhone SE (375x667): no
  console errors, no horizontal scroll on any tab, intro swipe and Skip save the pref,
  Replay and Escape work, offline reload renders from cache `ekg-v3` (23 files including the
  intro images), manifest standalone with all icons. Text contrast 5.2:1 or better.
  `node tests/run.js` passes (3,068,007 checks, including new progress tests).
- Revision: `js/theme.js` (in `<head>`, no flash), Appearance sheet (gear button) with
  App theme and Strip colors plus a live preview strip, both themes and three strip themes
  in tokens, new icon, intro screenshots recaptured in the light theme. Verified again in
  light and dark at iPhone 13 and SE: no errors, no horizontal scroll, offline reload with
  24 cached files.
- Not verified: the iPhone status bar style switch (light theme sets `default`, dark sets
  `black-translucent` at launch; iOS may only read it when the icon is added).
- Not verified: real iPhone (Safari Add to Home Screen, actual Home Screen icon, safe-area
  insets, the sideways full-screen strip in hand), VoiceOver. Owner check after the push.
