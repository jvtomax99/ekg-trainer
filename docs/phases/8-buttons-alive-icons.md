# Step 3e: buttons, outlines and alive icons

Owner's ask (2026-11-19): change the look of the buttons and the outline of the app, and
make it "more alive, like Home's live monitor strip". He compared three mocked directions
(A clean clinical, B monitor bezel, C iPhone native) and picked A plus moving icons.

## What it does
- One button family with three levels (primary, secondary, tertiary). Before: 10 different
  button looks and 6 corner sizes across the five screens, counted in Chromium.
- One outline system per theme: light cards on a shadow, dark cards on a border.
- No boxes inside boxes: Accuracy by group is a list of rows with a small ring and an arrow
  (no empty cell in the grid), Today's numbers sit between hairlines, tiles inside cards are
  flat.
- Header buttons are plain icons. Icon chips are one tint (the red "review due" chip broke
  the rule that red means wrong).
- The Learn / Practice / Exam tiles on Home, which repeated the tab bar, are gone.
- Icons move like the monitor strip (details in DESIGN.md, "Alive icons"). The looping shine
  on primary buttons and the orange tab dot are replaced by this motion.

For the nurse: less to read on each screen, a clear "tap this" button, and the same monitor
language as the strips he studies.

## Not in this step
- No new screens, data or settings. No change to clinical content, the strips, the start
  menu or the film.
- No heartbeat on a correct answer, no motion in Exam or Learn icons beyond the tab draw-in
  (possible later; Exam should stay calm).
- No Settings switch for the motion: Reduce Motion on the phone turns it off.

## How similar tools do it, and where this is better
Not researched in depth for this step (it is a restyle, not a new feature). The comparison
that mattered was the owner's: three directions mocked on this app's own screens. Option B's
problems in the mock (9 px labels, "Near the cutoffs" wrapping and pushing answers out of
thumb reach) are why it was not picked.

## Done when
- Every screen at 390 px in light and dark: three button levels only, no bordered box inside
  a bordered card, no empty grid cell on Home. Checked in Chromium (before/after screenshots).
- With Reduce Motion on, every icon is whole and still (checked: dash pattern and animation
  both `none`).
- `node tests/run.js` and the site check pass. `sw.js` VERSION bumped (ekg-v10).
- Owner checks it on the real iPhone.

## Status
Built 2026-11-19 on `claude/gallant-heisenberg-xh2mwo`, checked in Chromium. Waiting for the
owner's "push". Real-iPhone check pending.
