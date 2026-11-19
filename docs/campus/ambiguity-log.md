# Campus ambiguity log

Everything about the campus that is not confirmed, where sources disagree, and what
would settle it. Nothing on this list is built as fact. Started 2026-11-19 (step 5).
Boards: `boards/1a-main.md`, `boards/1b-pavilion.md`, `boards/1c-htp.md`.
Drawing to send the nurse: `nurse-sheet.svg` (made by `tools/campus-sheet.py`).

## Sources used
| Id | Source | What it gives | Rules |
|---|---|---|---|
| MAP | HMH official 2024 campus map (link in `docs/future/3d-campus.md`), viewed 2026-11-19 | Building names and their places, streets | HMH copyright: reference only, never committed or traced |
| OSM | OpenStreetMap API map call, bbox -74.0605,40.8805,-74.0525,40.8870, fetched 2026-11-19 (sha256 2c92ee89...) | Outlines and streets | ODbL, credit "© OpenStreetMap contributors". Most hospital outlines drawn December 2017 |
| L23 | USGS 3DEP lidar `NJ_NE6County_B23`, tiles K5B13 and K5B14, flown April 2023 to March 2025 (ScienceBase record and point timestamps) | Roof and ground heights now | Public domain |
| L14 | USGS 3DEP lidar `NJ_New_Jersey_SANDY_LiDAR_15`, tile 18TWL790255, flown March to April 2014 | Heights before Helena Theurer Pavilion | Public domain |
| HMH | HMH Helena Theurer Pavilion page ("A Nine-Story Surgical and Intensive Care Tower") | Story count | Quoted, not copied |

Method for every height: `tools/campus-heights.py` (docstring). "About N m" means the
lidar roof above the ground right beside the building, rounded.

## Open

| # | Question | What we know | What would settle it | Blocks |
|---|---|---|---|---|
| 1 | Is "the Pavilion" (owner: existing, about 9 stories) Schlesinger Pavilion? | MAP puts Schlesinger Pavilion at the south end of the main complex. L14 and L23 both show a block there about 47 m tall (highest about 53 m), the only part of the complex over 40 m. OSM calls the whole complex "Patient Pavilion", a name MAP doesn't use | The nurse says yes or no | The 1B name. Shown as "South tower of the main hospital, likely Schlesinger Pavilion" |
| 2 | Where is St. John inside the main complex, and how far does it reach? | MAP lists St. John, Strawbridge, Main, Conklin north to south; St. John at the north end, next to Emergency and the Don Imus center. No open source draws the boundaries. The north half of the complex is about 30 to 34 m tall (owner: St. John about 6 stories) | The nurse marks squares on `nurse-sheet.svg` | The St. John label and the "5 St. John" view in step 6 |
| 3 | Which way does 5 St. John face? | Nothing | The nurse | Step 6 camera |
| 4 | Is part of Helena Theurer Pavilion built over 2nd St? | L23 shows a roof about 29 m up over a 40 m stretch of 2nd St as OSM draws it (from about 30 m south to 5 m north of the hospital pin's latitude), right beside the tower, with open road on both sides. OSM and the lidar line up within about 2 m elsewhere, so it is not a misalignment. Owner's notes mention "elevated structure, supporting columns, roadway relationship" | Street photos (step 6 reference board) | The model shows it solid to the ground, which is likely wrong underneath |
| 5 | Exact Helena Theurer Pavilion outline | Taken from L23 vs L14: every roof over 12 m that is 10 m+ taller than in 2014 (8,153 m²). Misses any part under 12 m and any part where a tall building stood in 2014. The curved west face shows only roughly at this precision | Photos plus a closer look at L23 | Fine for a blockout; refine in step 6 |
| 6 | New building north of Hillcrest | OSM way 1187347562 (traced from Microsoft footprints): about 5 m in 2014, about 27 m now. MAP shows a light grey shape there with no name | MAP doesn't name it; street photos or the nurse | Shown as "Campus building" |
| 7 | Is OSM's "Employee Parking Garage" the Helena Theurer Pavilion Parking? | MAP puts HTP Parking across 2nd St, south of Hillcrest; that is where this OSM outline sits. It stood already in 2014 (about 19 m) | The nurse or a sign photo | Labeled by its MAP position; low stakes (context only) |
| 8 | OSM names MAP doesn't use: "George Link Jr. Pavilion" (possibly the Link Lobby area), "Johnson Hall", "Patient Pavilion", "David Joseph Jurist Research Center" (MAP: "David & Alice Jurist") | Names differ or are missing on MAP | MAP wins; the app shows only MAP names | Shown as "Campus building" where MAP has no name |
| 9 | Medical Plaza at 20 Prospect Ave, research tower at 40 Prospect Ave | MAP shows both buildings but not the numbers | An address source | Nothing in step 5 |
| 10 | Is there a real fountain, and where? | MAP shows an oval island in the main entrance loop off Prospect Ave | The nurse or a photo | Step 6 |
| 11 | Which entrance and garage does the nurse use? | Nothing | The nurse | Step 6 first camera view |
| 12 | Facade colors and materials (Helena Theurer blue glass, columns) | Press photos only (copyrighted, reference only) | Own photos from public sidewalks | Step 6 |

## Settled
- 2026-11-19: Helena Theurer Pavilion is the building that went up between L14 and L23
  on the east side along 2nd St (MAP position, HMH "nine-story", about 52 m in L23).
- 2026-11-19: The newer scan is 2023 to 2025, not "2023" as its name suggests; the older
  one was flown in 2014, published 2015.
- 2026-11-19: No campus building in OSM has a height or levels tag; all heights in the
  model come from lidar.
