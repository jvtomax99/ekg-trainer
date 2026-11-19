# Future module: cinematic intro video

Status: **documented only.** Produce after the core features and the 3D campus are built
and tested, so the video only shows real, working features.

Note, 2026-11-19: a short opening film (14.5 s, generated footage of a generic unit, the
app's own strip drawn over it) was built early as step 3c, at the owner's request
(`docs/phases/6-start-menu-film.md`). This longer piece, with real app captures and the
campus, is still to come and would replace or extend it.

Note, 2026-11-19 (later): the owner split credibility from this piece. A standalone pitch
clip and an in-app Evidence screen come first as step 3d (`docs/phases/7-evidence-and-pitch.md`);
this step 7 piece is the feature walkthrough and must keep the same rule: every claim true
and sourced.

## Goal
30 to 45 seconds, premium and cinematic. An experienced nurse should think: "this is a
seriously sophisticated ECG trainer built for someone like me." Not childish, generic or
like a slide deck.

## Storyboard (draft)
| Time | Beat | Content |
|---|---|---|
| 0 to 6 s | The profession | Hospital at night: glowing monitors, quiet critical care, nurses at work. Licensed stock or generated footage only; no identifiable real patients, no real hospital footage |
| 6 to 12 s | The challenge | Close-up of a rhythm strip; it turns into the app's strip |
| 12 to 26 s | The real app | Fast, clean cuts of actual captures: Learn, rhythm ID, timed exam, explanations, missed-rhythm review, mastery. Only finished features |
| 26 to 38 s | Campus reveal | Flyover of the real 3D campus: 30 Prospect, St. John, the Pavilion, Helena Theurer Pavilion in true positions; buildings lighting with mastery labels and percentages |
| 38 to 45 s | Close | App interface and title treatment |

Sound: subtle score and monitor-tone design, mutable, captions for any text.

## Tools (what's actually available)
- **Remotion**: React framework that renders video. `@remotion/three` renders 3D scenes
  frame by frame (animation driven by frame number). Good for titles, app-capture edits
  and the campus flyover rendered from the same 3D model. Not an interactive engine.
  Check Remotion's license terms before use (free tier has conditions).
- **Playwright** (in this environment): scripted, pixel-exact screen recordings of the
  real app at iPhone size.
- **HyperFrames by HeyGen** (connected): HTML and motion-graphics video projects with cloud
  rendering. Option for motion-graphic segments.
- **Canva** (connected): title cards, stills, color and type exploration.
- **Blender**: highest-quality campus flyover renders with real lighting, if needed.
- Live-action hospital atmosphere: licensed stock or a video generator outside this
  environment (for example via ChatGPT, per the owner's workflow). Verify license terms
  of whichever is used.

## In-app behavior
- Plays on first launch only when available; **Skip** visible immediately.
- Never forced again; replay from About or Help.
- Respects reduced motion (show a still title card) and starts muted.
- Sized for iPhone (portrait, H.264 or HEVC MP4), not downloaded until needed, so the
  trainer opens instantly. Offline fallback: a lightweight animated title card.
- Separate standalone export to send directly to the learner.

## Rules
- No imaginary or unfinished features shown as working.
- No HMH logos or protected branding in public versions without authorization; same
  independent-study disclaimer as the app.
