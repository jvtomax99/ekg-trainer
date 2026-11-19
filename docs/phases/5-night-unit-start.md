# Step 3b: Night unit start screen and Rounds

Owner's pick, 2026-11-19 ("Night unit now"). Comes from the nurse's idea: a start menu
like the HUMC 3D map, and a nurse's point-of-view movement through a unit as cards change.
Status: see the bottom of this file.

## What it does
1. **Home start card.** A generated "tele unit at night" picture, later a slow video loop,
   sits behind the existing Home start card (monitor, greeting, Start button). Home stays
   the start screen; there is no extra screen and no extra tap.
2. **Rounds.** In Practice (sessions and free practice), a hallway clip behind the header
   plays about one second forward each time a card changes, then freezes and dims while
   the strip is read. A 10-strip session is one walk down the hallway with 10 stops.

## Who it's for
The one telemetry / stepdown nurse, on night-shift breaks, with test anxiety. It should
feel like his shift, calm, never hype.

## Not in this version
- No real HUMC buildings, unit names, signage or logos in the footage. The hallway is a
  generic unit and is never labeled St. John (the campus spec bans real interiors, and
  unverified details are never invented).
- No ongoing movement while a strip is being read. The hallway moves for the first
  second as a new card comes up, then holds still. (The answer clock starts with the
  card as before; the second of movement is the same on every card.)
- Nothing in Exam: the exam screen stays plain, like the real exam.
- No sound.
- No readable monitor screens or text in the footage (generated rhythms are nonsense; the
  only trace on screen is the app's own coded one).
- No people's faces, no patients.
- No change to Home's cards, scoring or stored progress (one new pref, additive).
- Not the real campus. When the 3D campus exists (steps 5 and 6), stills of our own model
  replace the generic footage, with Runway adding only night atmosphere.

## How similar tools do it, and where this can be better
From memory and `docs/research.md`; not re-checked on 2026-11-19.
| Tool | Start screen | Weak spot | What we do instead |
|---|---|---|---|
| SkillStat Six Second ECG | Game-style mode menu | A menu to get through before any strip | Keep the one-tap Start on Home |
| Practical Clinical Skills | Plain lists of drills | No sense of place, desktop feel | A night unit that looks like his shift |
| Duolingo | No start menu, opens on the next lesson | Streak pressure | Same directness, no pressure, calm motion |

## Rules it must keep
- The app opens instantly and works offline even if the picture or clip never loads.
  The still is small (WebP, under 150 KB) and precached; the clip is fetched after the
  app is open, stored on first use in its own offline store (`ekg-media-v1`, kept across
  app updates), and is NOT in `sw.js` `FILES` (a failed download
  must not break install). Budget: each clip under 3 MB.
- `prefers-reduced-motion`: still picture only, no clip, no Rounds.
- A Settings switch ("Unit backdrop": on / off), stored in `ekg.prefs.v1` (additive).
- Text over the picture keeps 4.5:1 contrast (dark scrim), in light and dark themes.
- Every generated file is listed in `CREDITS.md`.

## Runway
- Account: Pro plan, 4 credits left on 2026-11-19. Video needs a top-up (1,000 credits
  for $10) or the monthly reset. Estimate: stills plus two or three 10 s takes at 720p
  (about 300 credits each), roughly 1,000 credits.
- Terms (runway.com/terms-of-use, read 2026-11-19, sections 1 to 10 only): Runway claims
  no ownership of outputs and does not restrict commercial use. The usage policy page was
  not read.
- Look: dim hospital corridor at night, the app's blue and teal with warm light from
  doorways, portrait 9:16, slow steady forward walk at eye level.

## Done when
- Home shows the unit picture behind the start card at 390 px and 360 px, text readable in
  both themes, and the app still opens in airplane mode.
- With the switch off or reduced motion on, Home and Practice look as they did before
  (apart from the still on Home when only reduced motion is on).
- In a 10-strip session the hallway moves only between cards, and Exam shows no backdrop.
- `node tests/run.js` and the site check pass.

## Status
- 2026-11-19: built. Look B (wider corridor, brighter station), one 10 s walk generated
  with Runway (about 310 credits in all, 700 left). Shipped files: `img/unit/unit.webp`
  (13 KB, the clip's first frame) and `img/unit/walk.mp4` (467 KB, cropped to the middle
  band, 540 x 604, no sound).
- Changed from the plan: Rounds is not a banner. A banner pushed the fourth answer off
  the screen at 390 px, so the hallway sits behind the Practice header and takes no room.
- Checked in Chromium at 390 px, 360 px and desktop, light and dark: Home picture and
  slow walk; hallway moves one second per card and stops (10 stops, then starts over);
  nothing in Exam; picture only with Reduce Motion; nothing with the switch off; app,
  picture and clip load with the network off after one online visit. `node tests/run.js` (3,069,123 checks) and the site check pass.
- Reviewer (fresh subagent) findings fixed: the clip no longer waits for a load event
  iPhones may never send; the Home walk stops when another tab is open or the app is in
  the background; the off switch clears the screen at once; the clip has its own offline
  store; a dark scrim sits under the Practice header text.
- Runway usage policy (runway.com/safety/usage-policy, read 2026-11-19): no rule against
  publishing your own outputs and no labeling requirement.
- Merged and live 2026-11-19 (pull request #2); live site checked in Chromium at 390 px.
- Not checked: a real iPhone (Safari autoplay of the muted clip, battery).
