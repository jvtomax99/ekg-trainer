# Future module: 3D HUMC campus

Status: **documented only.** Starts after phases 2 to 4 are stable (see `SPEC.md`).
Optional and loaded separately: the trainer must stay fast and work offline without it.

## Goal
A geographically and architecturally faithful, interactive 3D miniature of the real
Hackensack University Medical Center campus. It must not look like a generic hospital.
Footprints, connections, facade colors, relative heights, streets, landscaping, entrances
and recognizable exterior features all matter. Fewer accurate buildings beat many generic ones.

## Building priorities (owner, 2026-11-19)

| Priority | Building | Owner notes | Verified so far |
|---|---|---|---|
| 1A | Main hospital at 30 Prospect Ave, including **St. John** | Geographic centerpiece. St. John is one of the oldest parts of the connected main hospital, about 6 stories, NOT a freestanding or modern tower and NOT the newest entrance. Connected sections include St. John, Conklin, Strawbridge and others. The nurse works on 5 St. John | Official 2024 map labels St. John Building, Strawbridge Building, Main Building, Conklin Building and Schlesinger Pavilion as one connected complex between Prospect Ave and Second St. HMH visitor page: "Ground Floor St. John". Height: not verified |
| 1B | The existing ~9-story **Pavilion** | Separate, prominent part of the connected complex, about equal priority to 1A. Distinct from Helena Theurer Pavilion | **Ambiguous:** the map's only other "Pavilion" in the complex is **Schlesinger Pavilion** (south end, by Second St). Confirm with the nurse that this is the building meant |
| 1C | **Helena Theurer Pavilion** | Showpiece. Blue glass facade, sweeping geometry, elevated structure, supporting columns, roadway relationship, architectural lighting; stunning at night | HMH page: "A Nine-Story Surgical and Intensive Care Tower". Map: east side along Second St, curved west face, own parking structure across Second St. Press: 530,000 sq ft, opened Feb 2023, architects RSC Architects and Page. Blue glass and columns: confirm from photos |
| 2 | **Medical Plaza**, 20 Prospect Ave | Near the front of the complex. UI name: "Medical Plaza" (never "Mediplex") | Map: "Justice Marie Garabaldi Medical Plaza" (spelling as printed) beside the main entrance on Prospect Ave. Address 20 Prospect: not verified |
| 3 | **Research tower**, 40 Prospect Ave | Independent mastery destination | Map: "David & Alice Jurist Research Center" at Prospect Ave and Atlantic St. Likely the same building; address not verified |
| 4 | **Women's and Children's** | One unified destination, not split by service | Map: Donna A. Sanzari Women's Hospital, Joseph M. Sanzari Children's Hospital, Don Imus/WFAN Pediatric Center for Tomorrows Children, along Atlantic St, connected to the main complex |
| Optional | **John Theurer Cancer Center** | Last. Keep its real position, don't move it closer | Map: across Second St at Atlantic St, northeast of the complex |

Also on the map (context, not destinations): Emergency and Trauma Center, Imaging Center,
Link Lobby, main entrance drive loop off Prospect Ave, Main Parking Garage, Helena Theurer
Pavilion Parking, Hillcrest Building, Alfred N. Sanzari Medical Arts Building (across
Prospect), Gabrellian Child Care and Learning Center, Audrey Hepburn Children's Center,
public and employee parking north of Atlantic St, skybridges over Atlantic St and Second St.
Streets: Prospect Ave, Atlantic St, Second St, Essex St, First St, S. Prospect Ave.

## Reference sources
- Official 2024 campus map (HMH copyright, reference only, do not commit or redistribute):
  https://www.hackensackmeridianhealth.org/-/media/project/hmh/hmh/public/locations/2024-humc-campus-map.jpg
- Patient and visitor information: https://www.hackensackmeridianhealth.org/en/locations/hackensack-university-medical-center/patient-and-visitor-information
- Helena Theurer Pavilion: https://www.hackensackmeridianhealth.org/en/locations/hackensack-university-medical-center/helena-theurer-pavilion
- Location pin: 40.883701, -74.056320 (HMH location page)

| Data | Use | Rules |
|---|---|---|
| OpenStreetMap footprints | Starting footprints, roads | ODbL: credit "© OpenStreetMap contributors"; check accuracy against the map |
| USGS 3DEP lidar (if coverage exists) | Heights, terrain | US government data, generally public domain; check coverage |
| Own photos from public sidewalks | Facades, colors, glass, lighting, signage | Best option. Exteriors and public areas only |
| Architect, press, HMH photos | Visual reference only | Copyrighted; don't ship or trace into textures |
| Google Photorealistic 3D Tiles | Not usable | Policy bans caching, extraction, offline use, and content derived from Google Maps content |

## Verification workflow (before any detailed model)
1. **Reference board** per building: verified name, address, map position, photos (street
   and aerial), height estimate with source, footprint, orientation, facade materials and
   colors, connections (bridges, links), entrances, signage.
2. **Cross-check** official map vs aerial vs street-level imagery. Log disagreements.
3. **Ambiguity log**: anything unconfirmed is listed, never invented (today: which building
   is "the Pavilion", St. John height, Medical Plaza and research addresses, whether a real
   fountain exists and where).
4. **Blockout**: simple massing of priorities 1A to 1C with correct footprints, heights and
   connections. Review with the nurse ("does this look like work?") before detail.
5. Then detail in priority order.

## Living campus
- Lighting: day, golden hour, night (night is the hero look).
- Landscaping: lawns, trees, flowers, plantings that match reality.
- Ambient life: a few pedestrians and cars on real roads, subtle and optional.
- Warm window light, glass reflections, real shadows.
- Smooth iPhone controls: one-finger orbit, pinch zoom, two-finger pan, tap a building.
- Designed camera flyovers.
- Signage: only where licensed (see Branding).

### Fountain
Aesthetic only, not a mastery reward. Water and lights always on regardless of progress.
Must sit where a real one is (or a real feature that fits). The map shows an oval island
in the main entrance loop off Prospect Ave; whether it is a fountain is **unverified**.
If no real fountain exists, decide with the owner; never place an invented fountain at a
random spot.

## Mastery-driven buildings
Buildings evolve with real learning data from the adaptive engine
(`docs/future/adaptive-learning.md`), never points.
- Dark sections gradually light; window and architectural accents light up; exterior
  detail refines; new viewpoints unlock; a short celebration on durable mastery.
- Each destination shows its topic and mastery, for example
  "St. John · Telemetry fundamentals · 86% mastery".
- **Never change real dimensions.** No extra floors, no moved buildings. The campus stays
  recognizable at every stage.

Draft topic mapping (tune later):
| Destination | Topic |
|---|---|
| St. John (main hospital) | Telemetry fundamentals: sinus rhythms, rate, intervals |
| The Pavilion | Atrial rhythms: AFib, flutter, SVT, PACs |
| Helena Theurer Pavilion | Critical care: lethal rhythms, VT, VF, torsades, post-op pacing |
| Medical Plaza | Conduction: AV blocks, junctional rhythms |
| Research tower | Advanced: 12-lead basics, measurement, borderline strips |
| Women's and Children's | Ectopy: PACs, PVCs, patterns |
| John Theurer Cancer Center | Review mastery: long-term retention across everything |

## Technical approach
- **Three.js** (recommended): plain JS, one vendored module file, no build step, loads
  glTF. Needs owner approval as the first dependency exception.
- **React Three Fiber**: only if the app ever moves to React plus a bundler.
- **Blender** (plus Blender GIS for OSM import): procedural massing from footprints, hand
  detailing of key facades, export GLB with Draco or meshopt compression, baked lighting
  for night.
- Budget: under 5 MB compressed GLB for the first version, under 150k triangles, 60 fps
  on a recent iPhone, low-detail fallback, offline after first load, separate tab loaded
  on demand.

## Safety, privacy, branding
- Exteriors and public areas only. No interiors, security posts, cameras, staff-only
  entrances, loading docks or anything that helps get around hospital security.
- No HMH logos, wordmarks or protected branding in any publicly distributed version
  without written authorization. Building names used as factual place names.
- Disclaimer on the campus screen and About: "Independent study tool. Not affiliated with,
  sponsored by or endorsed by Hackensack Meridian Health or Hackensack University Medical
  Center."
- Not legal advice: trademark and building-likeness questions go to HMH or a lawyer.

## Open questions for the nurse
- Is "the Pavilion" Schlesinger Pavilion?
- How tall is St. John, and which way does 5 St. John face?
- Is there a real fountain on campus, and where?
- Which entrance and garage does he use (for the opening camera shot)?
