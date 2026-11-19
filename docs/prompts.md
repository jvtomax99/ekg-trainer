# Build prompts

Paste one to start a step. Each assumes Claude reads CLAUDE.md, SPEC.md and the
step's spec first. Order follows the delivery sequence in SPEC.md.

## Step 2: Difficult rhythms
"Start step 2 of SPEC.md. Write docs/phases/2-difficult-rhythms.md first. Keep the
phase 1 architecture. Add clinically accurate harder rhythms with sources read directly
(LITFL, StatPearls, AHA): heart blocks (1st, 2nd type I and II, 3rd), atrial flutter, SVT,
junctional rhythms, PACs, PVCs and patterns, VF, asystole, torsades. Meaningful lookalike
distractors, borderline strips near cutoffs, stronger exam prep. Generator tests for every
rhythm, everything tagged pending nurse review. Include fixes from the owner's iPhone test.
Screenshot at phone width, verify the live site after push."

## Step 2b: Premium UI, icon, dashboard, onboarding
"Start step 2b. Read CLAUDE.md, HANDOFF.md and docs/phases/3-premium-ui.md. New
branch. Build, in order: the SVG app icon and all icon assets (apple-touch-icon, PWA
192/512/maskable, favicon) with manifest and head updated; one custom SVG icon sprite and
extended design tokens in DESIGN.md; restyled components and micro-animations; a Home
dashboard tab with honest data; skippable onboarding with real screenshots and Replay.
Keep every existing feature and test passing. Verify at iPhone 13 and SE sizes in
Chromium, standalone manifest, offline, contrast. Then the owner's push."

## Step 3: Adaptive learning
"Start step 3. Read docs/future/adaptive-learning.md, write the phase doc. Implement FSRS
with default parameters in vanilla JS, ekg.progress.v2 with migration from v1, mastery
per rhythm and category, contrast and boundary sessions, practice vs exam tracking, and
the Today / Mastery / Trends screens. Tests for scheduling and migration."

## Step 4: Photo import (optional)
"Start step 4 only if the owner confirms. Read docs/future/photo-import.md. On-device
only: pick or take a photo, crop/rotate/enhance, private IndexedDB collection, identifier
warning, caliper-based comparison with criteria. No external AI."

## Step 5: Campus research and blockout
"Start step 5. Read docs/future/3d-campus.md. Build reference boards and the ambiguity log
(no copyrighted images committed), confirm open questions with the owner, then a Three.js
blockout of priorities 1A to 1C as a separate, lazily loaded module. Owner approves the
Three.js dependency first."

## Step 6: Campus mastery visualization
"Start step 6. Detailed models in priority order, day / golden hour / night lighting,
real-location fountain if verified, mastery-driven illumination from step 3 data, iPhone
performance budget."

## Step 7: Cinematic intro
"Start step 7. Read docs/future/cinematic-intro.md. Storyboard, Playwright captures of real
features, Remotion edit with the campus flyover, sound with mute, in-app first-launch
behavior and a standalone export."

## Step 8: iPhone walkthrough
"Start step 8. Read docs/future/iphone-onboarding.md. Real captures on current iOS,
swipeable cards, replay from About."

## Step 9: Final QA
"Start step 9. Accessibility review, iPhone performance, clinical-content verification
with the nurse's review recorded, docs and decisions brought up to date."
