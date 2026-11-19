# Architecture

A static web app: plain HTML, CSS and JS, no build step, no packages, no server. GitHub
Pages serves `main` from the root folder. Nothing leaves the phone.

## Folders and key files

- `index.html` (about 130 lines): the shell. Loads `js/theme.js` in `<head>` (so the
  first paint has the right theme), holds the SVG icon sprite (`<symbol id="i-...">`), one
  `<section id="view-...">` per tab (home, learn, practice, exam, progress), the tab bar
  and dialogs, then the other scripts in this order: rhythms, ecg, quiz, strip, fsrs,
  progress, tour, unit, app. Each script adds itself to `window.EKG`.
- `styles.css`: the whole look. Tokens on `:root` per theme (`data-theme`, `data-strip`);
  values come from `DESIGN.md`.
- `js/rhythms.js`: the rhythm library, data only (criteria, generator ranges, teaching
  text, source ids, `review: "pending"`). Clinical content lives here and nowhere else.
- `js/ecg.js`: the waveform generator. Builds events first (P waves, conduction, drops,
  ectopic beats), then draws each beat as a sum of Gaussian waves, then reports the
  features it built.
- `js/quiz.js`: answer choices, explanations from the strip's own measurements, "why
  not" reasons, exam scoring. No DOM.
- `js/strip.js`: draws strips on `<canvas>` (paper grid, calibration pulse, trace,
  calipers, live sweep).
- `js/fsrs.js`: FSRS-6 scheduler, a port of py-fsrs 6.3.3. Pure math.
- `js/progress.js`: everything stored (keys below), mastery, trends.
- `js/theme.js`: app theme and strip colors from the prefs.
- `js/tour.js`: the first-launch intro (8 cards, screenshots in `img/tour/`).
- `js/unit.js`: the night unit backdrop (step 3b): the picture behind Home's start card
  and "Rounds", the hallway clip that moves one step between practice cards. Files in
  `img/unit/`: `unit.webp` (precached) and `walk.mp4` (fetched after the app is open,
  kept by the offline cache on first use, never required).
- `js/app.js` (about 900 lines): all the screens. Sections by banner comment
  (`// ---------- Exam ----------`): helpers, strip widget, feedback, tabs, Home
  dashboard, adaptive sessions, Learn, Practice, Exam, Progress (Mastery, Trends, Exams),
  dialogs (About, Settings), start.
- `sw.js`: the offline copy. `FILES` lists every file the app loads; bump `VERSION`
  (`ekg-v5` now) whenever an app file changes, or phones keep the old one.
- `manifest.webmanifest`, `icons/`: install info and app icons (made by
  `tools/make-icons.js`).
- `tests/run.js`: the checks (`node tests/run.js`, `N=200` for a quick run).
  `tests/fsrs-vectors.json`: numbers from py-fsrs that `js/fsrs.js` must match.
- `tools/`: dev-only scripts, never loaded by the app: `make-icons.js` (icons),
  `capture-tour.js` (intro screenshots), `fsrs-vectors.py` (test vectors).
- `.github/site-check.cjs` and `.github/workflows/site-check.yml`: the checks GitHub runs
  on every pull request and push to `main` (quick tests, then the page at phone and
  desktop width).
- `SPEC.md` (what, who, phases), `DESIGN.md` (look), `CLAUDE.md` (rules),
  `HANDOFF.md` (latest handoff), `docs/` (this file, decisions, research, sources,
  phase docs, future module specs, build prompts, and Jose's shared working rules:
  `assets.md`, `design-rules.md`, `cleanup-audit.md`, `refactor.md`).

## How data moves

- **A strip**: app.js picks a rhythm (adaptive weights from progress), `ecg` generates it
  with random variation inside the rhythm's criteria, `strip` draws it, `quiz` builds the
  choices and, after an answer, the explanation from that same strip's measurements.
- **Stored on the phone** (`localStorage`, versioned keys; change a shape = new version
  plus a migration, so progress is never lost):
  - `ekg.progress.v2`: answers (rhythm, right or wrong, time, mode, pick, near-cutoff),
    sessions, and FSRS items (`r:<rhythm>`, `b:<rhythm>` near a cutoff, confused pairs).
  - `ekg.progress.v1`: the old key, replayed once into v2 and left untouched.
  - `ekg.prefs.v1`: disclaimer seen, intro version seen, theme, strip theme, exam
    settings, unit backdrop on or off. New fields are additive with defaults, so no key bump.
- **Offline**: `sw.js` caches `FILES` on install, then serves from the cache and
  refreshes it in the background.
- No accounts, no names, no patient data, no network calls besides loading the app.
