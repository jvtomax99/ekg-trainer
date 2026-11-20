# Future module: iPhone onboarding walkthrough

Status: **built into the first-launch intro (`js/tour.js`), 2026-11-20.** 9 cards, one line each:
welcome, tabs, Learn, Practice, misses, Exam, "what this is and isn't", Home Screen, offline and
your data (all three limits below). Designed first on a Claude Design canvas ("EKG Trainer
onboarding"). Not done: Monitor view and Exam settings get no card of their own; the 9th card
is over the 6 to 8 below because the honesty card stays until the nurse review is finished.

Original status: documented only. Separate from the cinematic intro: this one is practical.
Build after the features it teaches exist, using real screen captures.

## Steps (short, replayable from About or Help)
1. Getting around: the four tabs (Learn, Practice, Exam, Progress), plus Campus when it exists.
2. Learn: the 5-step approach and rhythm cards; Monitor view.
3. Practice: answer, read "This strip" and "Why not", use Measure and Zoom.
4. Missed and review sessions: where misses go and how they clear.
5. Exam: settings, timer, lethal rule, reviewing errors.
6. Progress and mastery.
7. Install: in Safari, Share, then Add to Home Screen; open from the icon. (Re-capture on
   the iOS version current at build time; Safari menus move between releases.)
8. Offline: works offline after the first visit; updates arrive on the next open with signal.

## Limits to state plainly
- Progress lives on this phone only. No sync, no backup yet.
- On iPhone, the Home Screen app and a Safari tab keep **separate** progress. Pick one
  (the Home Screen app) and stick with it.
- Clearing Safari website data erases progress.

## Design
- 6 to 8 swipeable cards, one real capture each, one line of text each, Skip on every card.
- iPhone and Safari only. No Android instructions.
