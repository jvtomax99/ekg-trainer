# Handoff

Updated 2026-11-19 (step 5 built). Read CLAUDE.md, then SPEC.md, then this.

## Done
- Live at https://jvtomax99.github.io/ekg-trainer/ since 2026-11-19 (moved from https://chromedigi.github.io/ekg-trainer/, which no longer gets updates).
- Phase 1 and 2 live (26 rhythms, exam).
- Step 2b (premium UI, icon, light/dark, strip themes, Home dashboard, intro) merged to main
  and live. Owner checked it on a real iPhone: "looks perfect".

## In progress
- Step 3 (adaptive learning) merged to main and live. FSRS-6 scheduler (`js/fsrs.js`), `ekg.progress.v2` with v1 replay, contrast and
  near-cutoff items, mastery, Today card on Home, 10-strip sessions, Progress
  Mastery/Trends/Exams. Details, verification and gaps: `docs/phases/4-adaptive-learning.md`.
- Owner hasn't checked step 3 on the real iPhone yet.

## Also done
- Step 3b (night unit start card on Home, hallway "Rounds" in Practice) merged and live
  2026-11-19. Details: `docs/phases/5-night-unit-start.md`. Runway has about 700 credits
  left. Owner hasn't checked it on the real iPhone yet (does Safari start the clip?).

## Also merged
- Step 3c, start menu and opening film (`docs/phases/6-start-menu-film.md`): merged to main
  (pull request #4). Runway has 780 credits left. Owner should listen to the music and check
  it on the real iPhone.

## Also merged (step 3e)
- Buttons, outlines and alive icons (`docs/phases/8-buttons-alive-icons.md`, pull request #6):
  one button family, one outline system per theme, icons that sweep like Home's monitor
  strip. Owner picked look A plus the motion. Real-iPhone check pending.

## Next
- **Step 5, campus blockout: live 2026-11-20 (pull request #7; `node tools/campus-check.js https://jvtomax99.github.io/ekg-trainer/` passed).**
  `docs/phases/9-campus-blockout.md` (Status at the bottom). Separate page `campus/`, opened
  from About; Three.js 0.187.0 vendored (owner approved). Data: `tools/campus-heights.py`
  (OSM outlines + USGS lidar, flown 2014 and 2023-2025). Docs: `docs/campus/` (boards,
  ambiguity log, `nurse-sheet.svg`). Checks: `node tools/campus-check.js`.
  Waiting on the nurse (send him `docs/campus/nurse-sheet.svg`): which squares are
  St. John, which way 5 St. John faces, is the south tower "the Pavilion" (likely
  Schlesinger), real fountain, his entrance and garage. Then record answers in
  `docs/campus/ambiguity-log.md` and `campus/data/labels.json`.
  Re-running the data needs the lidar tiles again (about 1.5 GB; the USGS server throttles
  each connection to about 115 KB/s and answers 40+ parallel requests with a "wait" page:
  4 MB ranged pieces, 14 connections per file worked, about 15 minutes).
- Step 6 (campus detail, lighting, mastery) only after the nurse's answers.
- Step 3d leftovers (not urgent): the pitch clip (part C of
  `docs/phases/7-evidence-and-pitch.md`: Playwright recordings, ffmpeg, the film's score,
  captions from the doc's table). Waiting on the nurse's review via About, How this was
  built, Review the cards; when his copied review arrives, record each card as
  `reviewed: { by: "a telemetry RN", date: "<Mon YYYY>" }` in `js/rhythms.js` and fix what he
  flags first.
- "3,069,138 checks" = assertions in one full `node tests/run.js`: 20,800 generated strips
  (800 x 26 rhythms). Rate, PR and QRS are checked from the generator's beat timings; the
  waveform checks are that every beat is visible and no extra peaks show. Proves strips
  match the app's criteria, not that the criteria are right. Never show the raw number.
- PubMed abstracts: `curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=<PMID>&rettype=abstract&retmode=text"`
  works when pubmed.ncbi.nlm.nih.gov shows a cookie check.
- Video tools: HyperFrames compose/render are disabled from Claude Code; Canva is
  connected (video quality untested); Playwright records the real app; Remotion needs npm
  and owner approval, dev-only.
- Nurse review of the 26 rhythm cards (all `review: "pending"`) and of the draft mastery
  rules is still open. Most important open item.
- After UI changes: `python3 -m http.server 8765` then `node tools/capture-tour.js`.
- FSRS vectors: `tools/fsrs-vectors.py` (needs `pip install fsrs==6.3.3` in a venv).

## Environment notes
- litfl.com fetches work with plain curl. Use the exact slugs from `docs/sources.md`.
- NCBI Bookshelf, PMC and AHA Journals answered with reCAPTCHA / Cloudflare checks on
  2026-11-19. StatPearls asystole (S29) is cited from a search excerpt only.
- GitHub's Pages API is blocked by the session proxy; Pages settings are changed by the owner.
- Owner approves every push (send a phone notification naming the change).

## Open questions
- Which exam HUMC uses, its format and pass mark.
- Which rhythms feel wrong or too easy on the real monitor.
- Mastery rules: are 21 days and 3 days the right bar for this nurse's exam timeline?
- Campus: see `docs/campus/ambiguity-log.md` (12 open items).
