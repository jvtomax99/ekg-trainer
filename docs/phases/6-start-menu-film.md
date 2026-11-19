# Step 3c: Start menu and opening film

Owner's ask, 2026-11-19: "an intro start menu that functions like my other apps", a film
before the app opens, dramatic hospital music (ElevenLabs), a nurse moving through a unit
(Runway). Built ahead of the campus; the long cinematic intro (step 7,
`docs/future/cinematic-intro.md`) stays a later, separate piece.
Status: see the bottom of this file.

## What it does
1. **Start menu.** Every time the app opens: the night unit picture full screen, the app's
   name, a live coded trace, and two buttons: "Start" (with sound) and "Start without
   sound". One tap is needed anyway, because phones only play sound after a tap.
2. **Opening film.** About 14 seconds after the tap: unit doors open, a nurse walks the
   night hallway, stops at the station, a strip comes up that the app itself draws, the
   nurse moves fast down the hall, the title, then Home. Skip is on screen from the first
   second. Replay from About.
3. **Sound.** A short score made for the film. Only with "Start"; never by itself.

## Who it's for
The one telemetry / stepdown nurse. It should feel like his shift.

## Owner's decisions (2026-11-19)
- The film plays at **every start**, like C.F.B. (Claude recommended once a day: he opens
  the app many times a night in short breaks. Owner chose every start. The way out if it
  wears thin: the Settings choice below.)
- The nurse is seen **from behind and hands only**. No faces, no patients (same rule as
  step 3b).
- Runway topped up by $10 for this.

## Not in this version
- No voice-over. No monitor alarm or beep sounds in the music (a phone that plays a
  monitor alarm on a real unit makes people look up).
- No readable monitor screens in the footage: generated rhythms are nonsense. The only
  strip in the film is drawn by the app's own code, from a rhythm in `js/rhythms.js`.
- No real HUMC places, signs or logos; the unit is generic.
- No film inside Exam or between screens; only at the start and from Replay.
- No new clinical content, and no change to progress data (new prefs are additive).
- Not the 30 to 45 second cinematic with app captures and the campus (step 7).

## How similar tools do it, and where this can be better
| Tool | Start | Weak spot | What we do instead |
|---|---|---|---|
| C.F.B. (Jose's) | "Tap to start" / "Start without sound", then a 13.8 s film at every start, Skip, Replay in Profile | The film is the only way in each time | Same pattern, plus a Settings choice (every start, once a day, off) |
| Building Apps With Claude (Jose's) | A rendered picture and clip as the start menu | No sound choice | Sound is a choice on the first tap, remembered as the bigger button |
| Duolingo | A one-second logo, then the next lesson | No sense of place | A place (the unit), but one tap from it to a strip |

## Rules it must keep
- The app opens and works offline even if the film never loads. The film is fetched after
  the menu shows, stored in `ekg-media-v1`, NOT in `sw.js` `FILES`. If it isn't ready
  within a moment of the tap, the app just opens.
- `prefers-reduced-motion` or data saver: no film; the menu opens the app directly.
- Settings: "Opening film": every start (default), once a day, off. In `ekg.prefs.v1`,
  additive. "Off" also skips the menu.
- Not shown when the app reloads itself, or on a first launch before the disclaimer and
  tour logic can run: the tour still opens after it.
- All text over the film is real text (`textContent`), 4.5:1 contrast on a scrim.
- Film under 3.5 MB, portrait 720 x 1280, H.264 with AAC.
- Every generated file is listed in `CREDITS.md`; raw shots and music takes stay out of
  the repo.

## Done when
- At 390 px and 360 px the menu shows on open, "Start" plays the film with sound, "Start
  without sound" plays it muted, Skip opens Home at once, and the film ends on Home.
- Airplane mode after one online visit: menu and film still work. First visit with the
  film blocked: the app opens anyway.
- Reduce Motion: no film. Settings "Off": no menu, no film.
- `node tests/run.js` and the site check pass.

## Status
- 2026-11-19: built. Four stills, then four 5 s shots, generated with Runway (616 credits,
  780 left); two 16 s music takes from ElevenLabs, take 1 used (its big hit lands on the
  cut to the dash at 10.1 s). The cut: doors 0 to 2.4 s, the walk to 5.2, the station to
  6.8, the strip over the blurred station to 10.1, the dash to 12.7, the title to 14.5.
  Shipped: `img/film/open.mp4` (about 2 MB) and `img/film/open.webp` (19 KB).
- The menu's picture is the film's first frame (hands on the doors), so "Start" pushes the
  doors open.
- The strip is ventricular tachycardia from `js/rhythms.js`, drawn live by `js/strip.js`;
  the question turns into the rhythm's name from the same file. No new clinical content.
- Checked in Chromium at 390 px, 360 px and desktop: Start (sound on), Start without sound
  (muted), Skip, Replay from About, the film ending on Home by itself, a second run from
  the stored copy with the network off, the app opening when the film is blocked, Reduce
  Motion (no film), Settings off (no menu) and once a day (film once, then menu only), and
  the first-launch intro waiting until the film is over. `node tests/run.js` (3,069,123
  checks) and the site check pass.
- Not checked: a real iPhone (does Safari start the film with sound on the tap, and how
  loud is it), and nobody has listened to the music: it was picked by its loudness shape.
- In the walk shot the nurse glances to the side for a moment, so part of a profile shows
  at a distance. Kept; a retake costs 150 credits if the owner wants none at all.
