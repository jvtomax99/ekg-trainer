# Step 3d: Evidence screen, nurse review, and the pitch clip

Owner's ask, 2026-11-19: the app should feel like a serious, evidence-based clinical
education platform to an experienced RN (CTICU or critical care), not a quiz app. First
impression: "professionally developed, scientifically grounded, worth my time." Owner
proposed two videos (a credibility intro, then a cinematic walkthrough).

Owner's decisions, 2026-11-19 (after Claude's case below):
- **Structure:** the 14.5 s opening film stays the only thing at launch. Credibility is a
  screen he can check (Evidence), shown once and always in About. The credibility video
  is a standalone clip Jose sends him, not played in the app. The walkthrough stays step 7.
- **Order:** evidence groundwork first (sources, this doc), ahead of the campus.

Status: **planned, waiting for the owner's OK on this doc.** No app code yet.

## Why this shape (Claude's case, kept for the record)
- An experienced nurse believes what he can check, not what a video tells him. A video can
  make him curious; the first ten strips decide whether he trusts it.
- He opens the app many times a night. One film at launch is already a cost; two more
  videos in front of the first strip get skipped by day two.
- What the app could truthfully say on 2026-11-19: 28 clinical references behind the
  rhythm rules (22 LITFL pages, 3 StatPearls, 2 ACC/AHA guidelines, 1 PMC review), no ACLS
  content, no CTICU content, every rhythm card "not yet reviewed". So "grounded in AHA
  guidelines and CTICU training standards" would be false, and he is the one person who
  knows the pacing-wire section doesn't exist. Every claim below is limited to what is true.
- His exam result stays out of everything (the repo is public, coworkers may see the clip).
  The framing he'll recognize without being named: experienced nurses are tested on hire,
  on a clock, and some exams fail a single missed lethal rhythm (`docs/research.md`).

## What it does
**A. Evidence screen** ("How this was built"), in About, and shown once after the first
film or intro. Every line is a fact with a source link or a number computed from the code:
1. *Every rhythm rule cites a published reference.* Count and kinds computed from
   `js/rhythms.js` sources (ACC/AHA guidelines, StatPearls, LITFL), each card links to them.
2. *Every strip is checked by a second program.* Each test run draws 20,800 strips (800
   for each of 26 rhythms) and measures them from the waveform: rate, 1500-rule rate, PR,
   QRS, regularity. Any strip whose on-screen numbers cross a published cutoff fails the
   run. Numbers come from the latest `node tests/run.js` and carry its date. Never "3
   million checks": that counts assertions and means nothing to a nurse.
3. *Why missed rhythms come back.* In the PULSE trial (3,013 nurses, 65 cardiac units,
   17 hospitals), online ECG education raised nurses' scores right away, but the gain was
   gone 15 months later [S31]. Spaced review and recalling instead of rereading improve
   long-term memory in studies of word and text recall [S32, S33]; this app schedules
   rhythms that way (FSRS-6). Worded as the reason for the design, not as proof it works.
4. *Why it matters.* The AHA's 2017 practice standards for hospital ECG monitoring include
   a section on staff education [S30].
5. *Who has reviewed it.* Computed: "Reviewed by a telemetry RN: 0 of 26 rhythm cards" (or
   the real number and date). Each card already shows its own status.
6. *Not covered yet.* Pacing wires and post-op strips (CTICU), ACLS "what now" steps,
   12-lead. Listed plainly.
7. The disclaimer stays word for word (study aid, not affiliated, follow unit protocols).

**B. Review mode** (for the nurse, in About): steps through the 26 rhythm cards with a
fresh strip each, "Looks right" / "Something's off" and an optional note. "Copy my review"
puts plain text on the clipboard for him to text to Jose; the app sends nothing. Claude
then records each card's status in `js/rhythms.js` as "Reviewed by a telemetry RN, <month
year>", never a name. Cards he flags get fixed and sourced before they're marked.

**C. The pitch clip** (standalone MP4, 45 to 60 s, portrait, captions, no voice-over so it
works muted on a break). Real app recordings by Playwright, caption cards rendered from
HTML, cut with ffmpeg (installed here; dev-only, nothing new ships). Music: reuse the
film's score unless the owner wants a new take. Draft beats, every caption true today:

| Time | Picture | Caption |
|---|---|---|
| 0 to 6 s | Dark card | "Telemetry nurses are tested on rhythm strips when they're hired. On a clock. Some exams fail you for one missed lethal rhythm." |
| 6 to 16 s | A strip drawing live, calipers on the PR | "Every strip is generated fresh. Measure it like the real thing." |
| 16 to 24 s | A rhythm card, its source link | "Every rule cites its published reference." |
| 24 to 36 s | Plain card, then a missed rhythm returning in Today | "Nurses' ECG scores rose after training, and were gone 15 months later (PULSE trial, 3,013 nurses)." / "So missed rhythms come back, on a schedule." |
| 36 to 46 s | Exam: timer, lethal rule, review | "Timed exams with the lethal-rhythm rule, and a full review after." |
| 46 to 55 s | Evidence screen, title | Review status as it stands; "Study aid. Follow your unit's protocols and provider orders." |

## Who it's for
The one telemetry / stepdown nurse cross-training in CTICU; then his coworkers if he
shares it. Jose sends the clip.

## Not in this version
- No AHA, AACN or HMH logos; never "AHA approved", "endorsed" or "certified". References
  are cited by name like any paper.
- No claim about CTICU content, ACLS or "clinically validated" until it exists.
- No "3 million checks"; no statistic without a source id or a reproducible test run.
- No mention of his exam result, no names, no hospital or unit named in the clip.
- No video in the launch path besides the existing film; the clip never autoplays in-app.
- No new dependency in the app; no change to progress data. Review answers live only
  until copied (or in a new versioned key `ekg.review.v1` if keeping them is wanted).
- The walkthrough video (step 7) and the AACN alert (needs a login) are not part of this.

## How similar tools do it, and where this can be better
| Tool | How it earns trust | Weak spot | What we do |
|---|---|---|---|
| UpToDate | Named authors and editors, "literature review current through" date, references per topic | Paywalled, long text, no way to see how anything was checked | Same transparency per rhythm card, plus how every strip is tested |
| Medscape Reference | Author and chief editor with credentials, last-updated date | Static images, no practice | Review status with date on each card, live strips |
| SkillStat, Practical Clinical Skills | Brand and volume (number of strips) | No references or review shown at all | Every rule links to its source; what isn't covered is said plainly |

## Done when
- At 390 px and 360 px: About has "How this was built"; every factual line opens its
  source; the reference count and review count are computed, not typed; the strip-test
  numbers match the latest run and show its date; no logos or endorsement words.
- Shown once after the first film or intro, then only from About; Reduce Motion and film
  "Off" still reach it.
- Review mode: all 26 cards, marks and notes survive closing the sheet, "Copy my review"
  puts readable text on the clipboard, nothing is sent.
- The clip: under 60 s, portrait 720 x 1280, every caption matches this doc's table (or
  the owner's edits), checked frame by frame; delivered to Jose as a file, not committed
  if over a few MB.
- `node tests/run.js` and the site check pass; `sw.js` VERSION bumped.

## Open questions for the owner
- Does the nurse do the review himself, or a coworker too? (He can review his own study
  tool; a second RN would make "reviewed" stronger.)
- Should review answers be kept on the phone, or only copied?
- The clip's music: reuse the film's score (no credits) or a new take (ElevenLabs credits)?
- Clip for him only, or for coworkers too (changes the first caption's tone)?
