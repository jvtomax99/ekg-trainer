# Phase 2: Difficult rhythms

Owner request 2026-11-19 (step 2 of `SPEC.md`). Real-iPhone test of phase 1: owner
reported nothing to fix.

## What it does
Grows the trainer from 5 to 26 rhythms, with distractors that are real lookalikes, strips
that sit near the cutoffs on purpose, and an exam that covers every lethal rhythm. Same
architecture as phase 1: rhythm data in `js/rhythms.js`, generator in `js/ecg.js`, answer
key and explanations in `js/quiz.js`, UI in `js/app.js`.

## Who it's for
The tele/stepdown nurse retaking a dysrhythmia exam: knows the basics, needs the hard ones
(blocks, junctional, ectopy patterns, lethal rhythms) and the near-misses between them.

## Rhythms (26)
- Sinus: NSR, sinus brady, sinus tach, sinus arrhythmia, sinus pause/arrest.
- Atrial: sinus with PACs, atrial flutter (2:1, 3:1, 4:1, variable), AFib, SVT.
- Junctional: junctional escape, accelerated junctional, junctional tach.
- Ventricular: unifocal PVCs, multifocal PVCs, ventricular bigeminy, PVC couplet,
  idioventricular (ventricular escape), AIVR, monomorphic VT, torsades, VF (coarse or
  fine), asystole.
- AV blocks: 1st degree, 2nd degree type I (Wenckebach), 2nd degree type II, 3rd degree.
- Lethal set for the exam rule: VT, torsades, VF, asystole.

## How the answer key works
Each rhythm's criteria are a small set of features: rate range, regularity pattern
(regular, phasic, pause, early beats, dropped beats, irregularly irregular, none), atrial
activity (sinus P, more P than QRS, none, fibrillatory, flutter, retrograde), PR behavior
(normal, long, lengthening, variable, short, none), QRS (narrow, wide, none), ectopy
(none, PAC, unifocal PVC, multifocal PVC, bigeminy, couplet) and shape (organized,
monomorphic, twisting, chaotic, flat). The generator builds atrial and ventricular events
first (P waves, conduction, drops, ectopics), then draws them, and reports the features it
built. "Why not" text is built from the first features a wrong choice fails.

## Lookalikes (distractors)
Choices come from each rhythm's lookalike list first (flutter 2:1 vs sinus tach vs SVT,
Wenckebach vs type II vs sinus arrhythmia, PAC vs PVC, fine VF vs asystole, AIVR vs
idioventricular vs VT, junctional vs sinus brady, torsades vs VT vs VF and so on), then the
same group, rarely anything else.

## Borderline strips
Optional "Near the cutoffs" in Practice and a borderline share in the exam. One feature
sits just inside a cutoff (rate 61 to 65 or 95 to 99 for NSR, 54 to 58 for brady, PR 0.21
to 0.23 for 1st degree, QRS 0.10 to 0.11 for narrow rhythms, junctional and ventricular
rate edges). The generator re-draws until both the exact rate and the 1500 rule land inside
the criteria, and displayed values are rounded so they never cross a cutoff on screen.
Feedback says which cutoff the strip was near.

## Stronger exam prep
- Rhythm set: all 26 or the core 5 from phase 1.
- Every lethal rhythm at least once, no rhythm twice in a row, spread over all groups.
- Lethal rule covers all four lethal rhythms.
- Optional borderline share (about 1 in 4 strips).
- Results broken down by group (sinus, atrial, junctional, ventricular, blocks).

## Practice
Rhythm set picker: all, core 5, one group, lethal only, missed. "Near the cutoffs" toggle.
Learn is grouped into collapsible sections so 26 cards don't load at once.

## Similar tools and where this is better
- SkillStat Six Second ECG: 27 rhythms, timed naming. No explanation of why a choice is
  wrong, no borderline strips. Here every wrong choice gets its own reason from the strip.
- Practical Clinical Skills: big fixed image library with multiple choice. Images can be
  memorized; distractors are not tied to the strip. Here strips are endless and
  distractors are the real lookalikes.
- Arrhythmia (iOS): side-by-side study mode, small set, no exam. Here the exam covers all
  lethal rhythms with a pass rule and a group breakdown.

## What phase 2 will NOT do
- Paced rhythms and failure to capture or sense (post-op side-track, needs its own sources).
- 2:1 AV block as an answer (LITFL: type I vs II often can't be told apart at 2:1; taught
  as a note only).
- Multifocal atrial tachycardia, PJCs, trigeminy, SA exit block, high-grade AV block,
  bundle branch blocks, 12-lead.
- "What now" actions or drug doses.
- Spaced repetition beyond phase 1's miss queue (that is step 3).

## Sources
LITFL pages were fetched and read directly this session (see `docs/sources.md`). NCBI
Bookshelf, PMC and AHA Journals answered with bot checks, so StatPearls asystole is cited
from a search-result excerpt and is marked that way.

## Tests (`node tests/run.js`)
Per rhythm, normal and borderline: features match the criteria, the true rhythm has zero
mismatches, every other rhythm has at least one, rate by both methods inside criteria,
displayed values agree with the categories, every QRS is visible in the signal, plus
rhythm-specific checks (PR lengthens before each Wenckebach drop, PR constant in type II,
AV dissociation in 3rd degree, compensatory pause after PVCs, flutter rate, VF and asystole
amplitudes).

## Status
Built and pushed 2026-11-19 (e2b4381). Live checks on https://chromedigi.github.io/ekg-trainer/
in Chromium as iPhone 13: all 11 files serve 200 with correct types, 26 rhythms load,
full click-through with no errors and no horizontal scroll at 390 and 360 px, offline
reload after the first visit still shows a strip and 4 choices.
- `node tests/run.js`: 3,067,999 checks pass (800 strips per rhythm, a third borderline).
- Every strip type looked at by eye in a gallery render; fixed faint flutter waves, a
  torsades twist that flipped too fast, PAC P waves too similar to sinus, and P-count
  wording that was confusing at the strip edges.
- Driven in Chromium as iPhone 13: Practice with set picker and near-cutoff toggle,
  feedback, all 5 Learn groups (26 cards), exam setup with the new options, a 10-strip
  all-26 exam with near-cutoff strips, results with group breakdown, Progress. No console
  errors, no horizontal scroll at 390 or 360 px.
- Not verified: real iPhone Safari for the new screens, clinical review by the nurse (all 26 rhythms tagged pending).
