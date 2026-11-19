# SPEC: EKG Trainer

What it does, who it's for, and in what order it gets built. Was `docs/plan.md`
until 2026-11-19; "Done when" lines were drafted then from the phase docs in
`docs/phases/` (Jose to confirm). Gaps marked TO FILL for Jose.

## What it is
A phone web app that drills rhythm strips for a telemetry / stepdown night-shift nurse:
read the strip, measure it, name it, then decide what to do. Works offline, installs to
the Home Screen, no login.

Live: https://jvtomax99.github.io/ekg-trainer/ (GitHub Pages, from `main`). It moved here from
https://chromedigi.github.io/ekg-trainer/ on 2026-11-19; that old copy no longer gets updates.

## Who it's for
- **The nurse** (the real user, not Jose): one nurse on 5 St. John (tele/stepdown,
  HUMC), cross-training in CTICU, retaking a hospital dysrhythmia exam, with test
  anxiety. Uses it on night-shift breaks, often without signal. His name stays out of
  this public repo. Details in `docs/research.md`.
- **His coworkers**, if it's good.
- Jose builds and runs it.

## Features

### Strips
Code-generated lead II strips at real scale (25 mm/s, 10 mm/mV), a new strip every time,
26 rhythms in 5 groups, each criterion sourced and marked "not yet reviewed" until the
nurse checks it. Calipers, 2x zoom, sideways full screen.
- Done when: `node tests/run.js` passes (every generated strip matches its rhythm's
  criteria and answer key), and every rhythm card cites source ids from `docs/sources.md`.

### Home
Live monitor header, continue studying, the Today card (what's due), a suggested next step
with its reason, recently missed rhythms, accuracy rings per group ("not tried yet" until
answered).
- Done when: a first-time user sees "not tried yet" everywhere, never a 0%; after a few
  answers the suggestion names its reason.

### Learn
The 5-step approach and one card per rhythm: criteria, lookalikes, sources, paper or live
monitor view, a new example on tap.
- Done when: every rhythm has a card that shows its criteria, its sources and a strip.

### Practice
Untimed. Pick a rhythm set, optional "near the cutoffs" strips. Feedback is built from the
measurements of the strip on screen, with a "why not" for each wrong choice (distractors
are real lookalikes). Missed rhythms come back until answered right twice in a row.
- Done when: a wrong answer shows the measured findings and why the chosen rhythm doesn't
  fit; that rhythm then shows in Missed until it is answered right twice.

### Adaptive sessions and mastery
FSRS-6 scheduling of skills (rhythm, rhythm near a cutoff, confused pairs from real
mistakes), graded automatically, 10-strip sessions, mastery claimed only after repeated
recall over weeks (draft rules, to tune with the nurse).
- Done when: the FSRS tests match py-fsrs exactly, old progress migrates with nothing
  lost, and a missed rhythm comes back within minutes, then at growing gaps.

### Exam
Timed, all 26 or core 5, 10/20/25 strips, pass mark 80/85/90%, lethal rule (VT, torsades,
VF, asystole), a countdown that can be hidden, optional near-cutoff strips, group
breakdown, full review after.
- Done when: a 10-strip exam runs to the end on a phone, scores right (the lethal rule
  fails a miss on a lethal rhythm), and every strip can be reviewed after.

### Progress
Mastery, Trends and Exams views: accuracy and speed per rhythm, this week vs before, exam
history.
- Done when: after a month of answers, all three views fill in with no errors.

### Start menu and opening film
Each open shows a start menu (unit doors at night, "Start" and "Start without sound"), then
a 14.5 second film with music: a nurse walks the unit, a strip comes up, the dash, the
title, Home. Skip from the first second; Settings: every start, once a day, off.
- Done when: on a phone, "Start" plays the film with sound and lands on Home, Skip opens
  Home at once, airplane mode still plays it after one online visit, and the app opens
  anyway when the film can't load or the phone is set to Reduce Motion.

### Evidence and review (step 3d)
A "How this was built" screen in About (shown once after the first film or intro): what
the rhythm rules cite, how every strip is tested, why missed rhythms come back (PULSE trial,
spacing and recall research), the review status, and what isn't covered yet. A review mode
lets the nurse mark each rhythm card and copy his notes to send. A standalone pitch clip is
sent to him outside the app.
- Done when: every factual line opens its source, the counts are computed from the code,
  no logo or endorsement words appear, and review notes can be copied with nothing sent.

### Intro and install
A short skippable intro with real screenshots (replay from About), a coded app icon,
light and dark themes (System default) and three strip themes. Works offline after the
first visit and installs to the Home Screen.
- Done when: on an iPhone, Add to Home Screen shows the icon and opens full screen, and
  airplane mode still opens the app with new strips.

## Not in v1
- No accounts, backend, sync between devices, or leaderboards.
- No 12-lead EKGs (v2).
- No hemodynamics, IABP or Impella waveforms, art line or PA tracings (v2 at the earliest).
- No hospital-specific policies or protocols, and nothing framed as HUMC policy.
- No real patient strips, no copied strip images.
- No drug dosing calculators.
- No CE credit or certification.
- No notifications or reminders.

## Later
- Stepdown "what now" scenarios (strip + vitals, stable vs unstable, sourced,
  nurse-reviewed), after step 3 once the core is solid.
- Post-op heart surgery strips: epicardial pacing modes, failure to capture or sense,
  post-op AFib (paced rhythms were deferred here from phase 2).
- High-contrast strip theme.
- Optional soft beep per QRS in live mode (phase 7).
- TO FILL: Jose's own list.

## Long-term goal
A serious ECG learning app with scientifically grounded mastery tracking, a faithful 3D
miniature of the real HUMC campus that lights up with demonstrated mastery, and a
cinematic intro. Worth using regularly, not a tech demo. The core trainer stays fast,
offline and usable without any of the heavy modules.

## Phases (delivery sequence, owner, 2026-11-19)

| # | Step | Spec | Status |
|---|---|---|---|
| 0 | Foundation docs | this file, `docs/` | done |
| 1 | Core trainer, 5 rhythms | `docs/phases/1-core-trainer.md` | done |
| 1b | GitHub Pages deploy + verify | live at https://chromedigi.github.io/ekg-trainer/ | done; owner tested on a real iPhone, nothing to fix. Moved to jvtomax99.github.io 2026-11-19 |
| 2 | Difficult rhythms: clinically accurate advanced rhythms, meaningful lookalikes, borderline strips, stronger exam prep | `docs/phases/2-difficult-rhythms.md` | done and live; nurse review pending |
| 2b | Premium UI: app icon, icon system, design language, home dashboard, first-launch onboarding (replaces old step 8) | `docs/phases/3-premium-ui.md` | done and live; owner checked it on a real iPhone: "looks perfect" |
| 3 | Adaptive learning: FSRS spaced repetition, mastery, contrast and boundary practice, practice vs exam tracking | `docs/phases/4-adaptive-learning.md` | done and live (merged 2026-11-19, live site checked in Chromium); real-iPhone check pending |
| 3b | Night unit start screen and Rounds: generated unit-at-night backdrop on Home, hallway movement between practice cards (owner's pick 2026-11-19, ahead of the campus) | `docs/phases/5-night-unit-start.md` | done and live (merged 2026-11-19, live site checked in Chromium); real-iPhone check pending |
| 3c | Start menu and opening film: a menu at each open, then a 14.5 s film with music of a nurse moving through the unit (owner's ask 2026-11-19, ahead of the campus; step 7 stays separate) | `docs/phases/6-start-menu-film.md` | done, merged to main 2026-11-19 (pull request #4); real-iPhone check pending |
| 3d | Evidence screen, nurse review mode and a standalone pitch clip: credibility from what the nurse can check, every claim sourced (owner's ask 2026-11-19, ahead of the campus) | `docs/phases/7-evidence-and-pitch.md` | Evidence screen and review mode built 2026-11-19, checked in Chromium; waiting for the owner's "push"; pitch clip next |
| 4 | Photo import (optional): educational images, on-device, privacy-first | `docs/future/photo-import.md` | when rules can be met |
| 5 | Campus research and blockout: reference boards, ambiguity log, accurate massing | `docs/future/3d-campus.md` | after 3d (owner, 2026-11-19) |
| 6 | Campus mastery visualization: detailed models, lighting, mastery-driven illumination | `docs/future/3d-campus.md` | |
| 7 | Cinematic intro video from real, finished features | `docs/future/cinematic-intro.md` | |
| 8 | iPhone install and usage walkthrough | `docs/future/iphone-onboarding.md` | moved into 2b (owner, 2026-11-19) |
| 9 | Final QA: accessibility, iPhone performance, clinical-content verification | | |

Rules for the roadmap: don't rebuild or replace the working trainer; heavy modules (3D,
video) load separately and only when opened; any new dependency gets an owner decision
first (logged in `docs/decisions.md`). Build prompts for each step: `docs/prompts.md`.

## Basic rhythm set (phase 2, final list checked against sources)
Sinus: normal sinus, sinus brady, sinus tach, sinus arrhythmia, sinus pause/arrest.
Atrial: PACs, atrial flutter, atrial fibrillation (controlled and RVR), SVT.
Junctional: junctional, accelerated junctional, junctional tach.
Ventricular: PVCs (unifocal, multifocal, bigeminy, couplets), idioventricular,
accelerated idioventricular, monomorphic VT, torsades, VF (coarse, fine), asystole.
Blocks: 1st degree, 2nd degree type I, 2nd degree type II, 3rd degree.
Paced: atrial paced, ventricular paced, AV paced, failure to capture, failure to sense
(moved to the post-op side-track; not in phase 2).
Lethal set for the exam rule: VT, VF, asystole, torsades.
Phase 2 built all of the above except paced (26 rhythms).

## Open questions for the nurse
- Which exam does HUMC use (Relias, HealthStream, internal), format and pass mark?
- What does the CTICU quiz him on most?
- After real-iPhone testing and phase 2: what's missing, wrong or annoying.
- Mastery rules: are 21 days and 3 days the right bar for his exam timeline?
- Campus: is "the Pavilion" Schlesinger Pavilion? St. John height? Real fountain?
