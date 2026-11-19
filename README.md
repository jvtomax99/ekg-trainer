# EKG Trainer

Phone-first, offline rhythm strip practice for telemetry / stepdown nurses. Plain HTML,
CSS and JavaScript, no dependencies.

**Educational simulation only.** Strips are computer-generated. Not for patient
monitoring, diagnosis or treatment decisions. Not affiliated with any hospital or exam
provider.

## What's in it (phases 1, 2 and 2b)
- 26 rhythms in 5 groups: sinus (incl. sinus arrhythmia, pause), atrial (PACs, flutter,
  AFib, SVT), junctional (escape, accelerated, tach), ventricular (PVC patterns,
  idioventricular, AIVR, VT, torsades, VF, asystole), AV blocks (1st, type I, type II, 3rd)
- Home: live monitor header, continue studying, a suggested next step with its reason,
  recently missed rhythms, accuracy rings per group ("not tried yet" until you answer)
- Short skippable intro with real screenshots (replay from About)
- Learn: the 5-step approach and one card per rhythm, grouped, with paper or live monitor view
- Practice: untimed, pick a rhythm set, optional "near the cutoffs" strips, explanations
  built from the strip on screen, "why not" for each wrong choice (distractors are real lookalikes)
- Missed: rhythms you miss stay here until you get them right twice in a row
- Exam: timed, all 26 or core 5, 10/20/25 strips, pass mark 80/85/90%, lethal rule (VT,
  torsades, VF, asystole), optional near-cutoff strips, group breakdown, full review after
- Progress: accuracy and speed per rhythm, this week vs before, exam history
- Calipers, 2x zoom and a sideways full-screen view on every strip; works offline;
  coded app icon for the Home Screen

**Live:** https://chromedigi.github.io/ekg-trainer/ (GitHub Pages from `main`). On iPhone:
open in Safari, Share, Add to Home Screen.

## Run it
Serve the folder with any static server, for example `python3 -m http.server 8000`,
then open http://localhost:8000. (Opening `index.html` directly works too, minus offline mode.)

## Test it
`node tests/run.js` generates 800 strips per rhythm (a third of them near a cutoff where the
rhythm has one) and checks each against its criteria, the answer key and rhythm-specific
rules (about 3 million checks). `N=100 node tests/run.js` for a quick run.

## Docs
`SPEC.md` (what, who, roadmap), `DESIGN.md` (look), `docs/ARCHITECTURE.md` (file map), `docs/sources.md` (clinical references),
`docs/phases/` (per-phase status).
