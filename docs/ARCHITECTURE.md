# Architecture

A static web app: plain HTML, CSS and JS, no build step, no packages, no server. GitHub
Pages serves `main` from the root folder. Nothing leaves the phone.

## Folders and key files

- `index.html` (about 130 lines): the shell. Loads `js/theme.js` in `<head>` (so the
  first paint has the right theme), holds the SVG icon sprite (`<symbol id="i-...">`), one
  `<section id="view-...">` per tab (home, learn, practice, exam, progress), the tab bar
  and dialogs, then the other scripts in this order: rhythms, ecg, quiz, strip, fsrs,
  progress, tour, unit, evidence, start, app. Each script adds itself to `window.EKG`.
- `styles.css`: the whole look. Tokens on `:root` per theme (`data-theme`, `data-strip`);
  values come from `DESIGN.md`.
- `js/rhythms.js`: the rhythm library, data only (criteria, generator ranges, teaching
  text, source ids, `review: "pending"` or a `reviewed: { by, date }` role and month).
  Clinical content lives here and nowhere else. Its `sources` also hold S30 to S33, the
  design evidence shown on the Evidence screen (not rhythm criteria).
- `js/ecg.js`: the waveform generator. Builds events first (P waves, conduction, drops,
  ectopic beats), then draws each beat as a sum of Gaussian waves, then reports the
  features it built.
- `js/quiz.js`: answer choices, explanations from the strip's own measurements, "why
  not" reasons, exam scoring. No DOM.
- `js/strip.js`: draws strips on `<canvas>` (paper grid, calibration pulse, trace,
  calipers, live sweep).
- `js/fsrs.js`: FSRS-6 scheduler, a port of py-fsrs 6.3.3. Pure math.
- `js/progress.js`: everything stored (keys below), mastery, trends.
- `js/evidence.js` (step 3d): data and plain functions for the "How this was built"
  screen (reference counts computed from the cards, the test-run facts `TESTS`, review
  counts) and the nurse's review text. `tests/run.js` checks `TESTS.perRhythm` against its
  own default, so the screen can't drift from the real run.
- `js/theme.js`: app theme and strip colors from the prefs.
- `js/tour.js`: the first-launch intro (8 cards, screenshots in `img/tour/`).
- `js/unit.js`: the night unit backdrop (step 3b): the picture behind Home's start card
  and "Rounds", the hallway clip that moves one step between practice cards. Files in
  `img/unit/`: `unit.webp` and `unit-lit.webp` (precached; night look and lit look, picked by time of day or
  pinned in Settings) and `walk.mp4` / `walk-lit.mp4` (fetched after the app is open,
  stored by `unit.js` itself in the `ekg-media-v1` offline store, which survives app
  updates; never required).
- `js/start.js`: the start menu and the opening film (step 3c). The menu covers the app on
  each open (`js/theme.js` adds `start-on` to `<html>` before the first paint unless the
  film is off in Settings; `?start=0` skips it). The film is `img/film/open.mp4` (14.5 s,
  with its music; cut by `tools/make-open-film.sh`): streamed the first time, then stored in
  `ekg-media-v1` and played from there. The menu picture `img/film/open.webp` is the film's
  first frame (precached). The strip and every word in the film are drawn by `start.js`
  over it, timed by `FILM` there, which must match the cut. Never required: the app opens
  without it.
- `js/app.js` (about 900 lines): all the screens. Sections by banner comment
  (`// ---------- Exam ----------`): helpers, strip widget, feedback, tabs, Home
  dashboard, adaptive sessions, Learn, Practice, Exam, Progress (Mastery, Trends, Exams),
  dialogs (About, Settings), How this was built (Evidence), review mode, start.
- `sw.js`: the offline copy. `FILES` lists every file the app loads; bump `VERSION`
  (`ekg-v9` now) whenever an app file changes, or phones keep the old one.
- `manifest.webmanifest`, `icons/`: install info and app icons (made by
  `tools/make-icons.js`).
- `tests/run.js`: the checks (`node tests/run.js`, `N=200` for a quick run).
  `tests/fsrs-vectors.json`: numbers from py-fsrs that `js/fsrs.js` must match.
- `tools/`: dev-only scripts, never loaded by the app: `make-icons.js` (icons),
  `capture-tour.js` (intro screenshots), `make-open-film.sh` (cuts the opening film from the source shots; needs ffmpeg), `fsrs-vectors.py` (test vectors).
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
    settings, unit backdrop (auto, lit, night or off), opening film (`film`: always, day or off; `filmDay`: the last day it played), Evidence
    screen version seen (`evidence`). New fields are additive with defaults, so no key bump.
  - `ekg.review.v1`: a nurse's content review from review mode (`marks`: per rhythm, looks
    right or something's off, a note, when). Separate from progress: "Reset progress"
    leaves it. Leaves the phone only when the nurse copies it.
- **Offline**: `sw.js` caches `FILES` on install, then serves from the cache and
  refreshes it in the background.
- No accounts, no names, no patient data, no network calls besides loading the app.
