# Handoff

Updated 2026-11-19. Read CLAUDE.md, then SPEC.md, then this.

## Done
- Phase 1 and 2 live at https://chromedigi.github.io/ekg-trainer/ (26 rhythms, exam).
- Step 2b (premium UI, icon, light/dark, strip themes, Home dashboard, intro) merged to main
  and live. Owner checked it on a real iPhone: "looks perfect".

## In progress
- Step 3 (adaptive learning) merged to main and live. FSRS-6 scheduler (`js/fsrs.js`), `ekg.progress.v2` with v1 replay, contrast and
  near-cutoff items, mastery, Today card on Home, 10-strip sessions, Progress
  Mastery/Trends/Exams. Details, verification and gaps: `docs/phases/4-adaptive-learning.md`.
- Owner hasn't checked step 3 on the real iPhone yet.

## Next
- Owner chose: **step 5, campus research and blockout** (`docs/future/3d-campus.md`,
  prompt in docs/prompts.md). Video comes after the campus so it's made once with real
  features. Three.js needs owner approval as the first dependency (ask with buttons).
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
- Campus: is "the Pavilion" Schlesinger Pavilion; St. John height; real fountain location.
