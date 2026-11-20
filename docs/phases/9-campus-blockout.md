# Step 5: Campus research and blockout

Owner's pick, 2026-11-19, after step 3d's screen and review mode went live. Spec:
`docs/future/3d-campus.md`. Status: **live 2026-11-20 (pull request #7), waiting for the
nurse's look** (see Status at the bottom). Plan approved by the owner 2026-11-19,
Three.js approved the same day.

## What it does
A first, plain 3D model of the real campus: grey blocks with the right footprints,
measured heights and connections for the three priority buildings (1A main hospital with
St. John, 1B the Pavilion, 1C Helena Theurer Pavilion), on the real streets. You can spin
it with one finger, pinch to zoom, drag with two fingers, and tap a building to see its
name. Behind it: a written reference board per building and an ambiguity log, so every
fact in the model has a source and every guess is listed instead of built.

The point of this step is one question for the nurse: "does this look like work?" Detail,
lighting, the fountain and mastery all wait for step 6.

## Who it's for
The nurse first (does he recognize his campus?), then Jose (is the 3D worth carrying on).

## How 3 similar tools do it, and where this can be better
Researched 2026-11-19.

| Tool | How it does it | Where ours can be better |
|---|---|---|
| Concept3D atlas3D (Mass General's campus map, 2017) | Vendor-built 3D models of each building laid over Google Maps; wayfinding, parking and accessible routes; online only ([concept3D](https://concept3d.com/blog/digital-wayfinding/mass-general-hospital-launches-atlas3d-powered-interactive-campus-map/), [PR Newswire](https://www.prnewswire.com/news-releases/concept3d-collaborates-with-boston-hospital-to-launch-interactive-campus-map-300426668.html)) | Works offline after one visit; tied to what the nurse has actually learned, not a map. We don't do wayfinding or interiors at all (security rule) |
| OSM Buildings / F4map style 3D (footprints from OpenStreetMap, pushed up into blocks) | Uses height or levels tags; with neither it assumes 3 levels of 3 m ([OSM Buildings blog, 2018](https://osmbuildings.org/blog/2018-02-28_level_of_detail/)) | I checked the OSM data for this campus (below): **no building has a height or levels tag**, so these viewers show every HUMC building at the same guessed height. Ours uses heights measured from government lidar |
| Forest (focus app: a tree grows while you focus, dies if you leave) ([forestapp.cc](https://forestapp.cc/), [App Store](https://apps.apple.com/us/app/id866450515)) | Progress shown as a world that grows; failure is punished (the tree withers) | Ours grows from real recall data (FSRS), not minutes spent, and never punishes: nothing withers or goes dark again, which matters for a nurse with test anxiety. Buildings never change real size |

## What the data can and can't tell us (checked 2026-11-19)
- **OpenStreetMap** (main API, campus area): named footprints exist for Medical Plaza,
  the Jurist Research Center, George Link Jr. Pavilion, "Patient Pavilion", Women's and
  Children's Pavilion, Imaging, Emergency/Trauma, JTCC, Hillcrest and others. Most were
  drawn in December 2017 and never updated. Missing: any height, any St. John / Conklin /
  Strawbridge split, and anything named Helena Theurer Pavilion (opened February 2023).
  Streets are all there (Prospect Ave, Atlantic St, 2nd St, Essex St, 1st St, South
  Prospect Ave). License: ODbL, credit "© OpenStreetMap contributors".
- **USGS 3DEP lidar** covers the campus: `NJ_NE6County_B23` (tiles K5B13 and K5B14, about
  0.8 and 0.7 GB, flown 2023 to 2025) and the older `NJ_New_Jersey_SANDY_LiDAR_15` (flown
  2014). US government data, public domain. Heights come from the newer one; the older
  one is a cross-check: a building present in the new scan and absent in 2014 on the east
  side by 2nd St should be Helena Theurer Pavilion, which gives its real footprint even
  though OSM lacks it.
- **Official 2024 campus map** (HMH, reference only, never committed): which named
  sections make up the connected complex and where they sit.
- **No open source splits the connected main complex into St. John, Conklin,
  Strawbridge and the rest.** Lidar shows where the roof heights change; it can't say
  which section is called what. That needs the nurse.

## The plan
1. **Reference boards** (`docs/campus/boards/1a-main.md`, `1b-pavilion.md`,
   `1c-htp.md`): text and links only, no images. Verified name, address, map position,
   measured height with method, footprint source, connections, entrances, facade notes
   with "confirm from photos" where we only have press photos.
2. **Ambiguity log** (`docs/campus/ambiguity-log.md`): every unconfirmed fact, where the
   sources disagree, and what would settle it. Starts with: which building is "the
   Pavilion" (Schlesinger Pavilion? OSM's "Patient Pavilion"?), where St. John is inside
   the complex and its height, Medical Plaza and research addresses, the fountain.
3. **Measure heights** (dev-only `tools/campus-heights.py`): download the two lidar
   tiles, take the roof height minus ground height inside each footprint section, round to
   the meter, write `campus/data/campus.json`. Needs `laspy` and `lazrs` in a throwaway
   venv (outside the project, never shipped). The script and its output are committed;
   the lidar files are not.
4. **Ask the nurse** (through Jose) to mark St. John and "the Pavilion" on a plain
   footprint drawing I generate from OSM plus lidar (our own drawing, not HMH's map).
5. **Blockout** (`campus/`): a separate page, `campus/index.html`, with its own script and
   the vendored Three.js. Grey blocks for 1A to 1C at measured heights, other campus
   buildings as faint context blocks, streets as flat lines, a tap card with the
   building's verified name (unconfirmed sections say "unconfirmed"). The disclaimer
   from `3d-campus.md` on screen.
6. **Link from the trainer**: one "Campus preview" row in About (not on Home, not in the
   tab bar). The trainer loads nothing from `campus/` until that row is tapped.
7. **Offline**: `sw.js` does not precache the campus. The first time it's opened, its
   files go into their own cache (`ekg-campus-v1`), so it opens offline after that and
   never slows the trainer's install or updates.
8. Review the diff with a fresh reviewer against SPEC.md, run the checks, screenshots at
   390 px and desktop, pull request.

## Three.js (needs the owner's OK: the app's first dependency)
- Pinned version 0.187.0 (released 2026-10-30), MIT license, vendored as files in
  `campus/vendor/` (no CDN, no npm in the app): the core module plus `OrbitControls.js`
  for touch. Measured on r180: about 0.76 MB raw, about 0.19 MB gzipped with
  OrbitControls. I'll re-measure on the pinned version. Loaded only on the campus page.
- Why not hand-written WebGL: step 6 needs glTF models, shadows and night lighting, which
  is weeks of code Three.js already has. Why not a flat 2.5D SVG picture: no spin or zoom,
  and step 6 would throw it away.
- Logged in `docs/decisions.md`, credited in `CREDITS.md`.

## Done when
- The three boards and the ambiguity log exist; every number in `campus.json` traces to
  the lidar script or a cited source; nothing unconfirmed is labeled as fact.
- On a phone at 390 px: the campus opens from About, spins, zooms, pans, tap shows a name,
  no horizontal scroll, the disclaimer shows.
- Airplane mode: the trainer opens and works with the campus never opened; the campus
  opens offline after one online visit.
- The trainer's first load is unchanged (no campus file in `sw.js` `FILES`, no campus
  request from `index.html`).
- `node tests/run.js` and the site check pass, with `campus/index.html` added to the
  workflow's page list.
- The nurse has looked at it (or it is waiting on him, said plainly).

## Not in this step
Textures, glass, lighting modes, night look, landscaping, cars, people, flyovers, the
fountain, mastery lighting, priorities 2 to 4 and JTCC as destinations, any HMH logo, any
interior, entrance details beyond the public main drive, wayfinding.

## Open questions (for the nurse, through Jose)
- Is "the Pavilion" Schlesinger Pavilion, by 2nd St at the south end?
- Where is St. John inside the connected complex? (He marks it on our drawing.) Which way
  does 5 St. John face?
- Is there a real fountain, and where? (Step 6, but asking now saves a round.)
- Which entrance and garage does he use? (For the first camera view.)

## Biggest risk
A wrong "St. John" label is the one mistake every staff member would spot at once, and
no open data can prevent it. Until the nurse marks it, the main complex shows as one
connected block with measured height sections and no St. John label.

## Status
- 2026-11-19: plan written, data sources checked (OSM, USGS lidar listing). Owner OK'd
  the plan and Three.js.
- 2026-11-19: built. What the data showed:
  - Helena Theurer Pavilion: the one large building put up between the 2014 and
    2023-2025 scans, on the east side along 2nd St, about 52 m (8,153 m² of roof).
    Part of it sits over 2nd St as OSM draws it, about 29 m up (ambiguity log #4).
  - The main complex is about 30 to 34 m tall along most of its length; its south end is
    a separate block about 47 m tall in both scans, where the 2024 map prints
    "Schlesinger Pavilion". Shown as "likely Schlesinger Pavilion" until the nurse says.
  - St. John is not marked: the map gives the order (St. John at the north end), not
    the boundaries. `docs/campus/nurse-sheet.svg` asks him to name the squares.
  - Three.js 0.187.0 ships unminified only: 2.2 MB raw, about 0.43 MB compressed (the
    plan's 0.19 MB came from a minified build of an older version).
- Checks run 2026-11-19: `node tools/campus-check.js` all passed (trainer requests
  nothing from `campus/`; trainer opens offline with the campus never opened; campus
  opens offline after one visit; taps on 1A, 1B, 1C show their names; 39,606 triangles;
  no horizontal scroll at 390 px; no script errors). `node tests/run.js`: all 3,069,138
  checks passed. Site check: passed for `index.html` and `campus/index.html`.
- Not verified: frame rate on a real iPhone (headless Chromium renders with software
  WebGL, so its speed says nothing about a phone); the nurse hasn't seen it.
