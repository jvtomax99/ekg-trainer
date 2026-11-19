#!/usr/bin/env python3
"""Campus blockout data from open sources (step 5). Dev-only, never loaded by the app.

Footprints and streets: OpenStreetMap (ODbL, "(c) OpenStreetMap contributors").
Heights: USGS 3DEP lidar, NJ_NE6County_B23 (public domain; flown April 2023 to March
2025 per the USGS ScienceBase record, and this tile's point timestamps), with the
NJ_New_Jersey_SANDY_LiDAR_15 scan (flown March to April 2014, published 2015) as a
cross-check for what was built since.

Method, per footprint: a 1 m grid of lidar points. Roof per cell = the highest return,
then a 3x3 median filter (drops antennas and single noisy returns). Ground = class-2
(ground) returns as 4 m block medians, with the gaps under buildings filled from the
neighbours (the campus slopes about 30 m). Cells under 3 m above local ground are open
(courtyards, plazas). The rest are measured from the lowest ground under the footprint
and banded (3 m by default) into sections; each section is a polygon with one height.
Nothing is guessed: a footprint with under 80% lidar cover is left out.

Setup (outside the project, never shipped):
  python3 -m venv /tmp/venv && /tmp/venv/bin/pip install "laspy[lazrs]" numpy pyproj shapely
Lidar tiles (about 0.8 + 0.7 GB + 29 MB) from the USGS National Map, listed by:
  https://tnmaccess.nationalmap.gov/api/v1/products?bbox=-74.0605,40.8805,-74.0525,40.8870&datasets=Lidar%20Point%20Cloud%20(LPC)
Run:
  /tmp/venv/bin/python -I tools/campus-heights.py --osm map.osm --new K5B13.laz K5B14.laz \
      --old sandy15.laz --out campus/data/campus.json [--report]
The OSM file is the API's map call for the bbox below:
  https://api.openstreetmap.org/api/0.6/map?bbox=-74.0605,40.8805,-74.0525,40.8870
"""
import argparse, json, math, sys, warnings, xml.etree.ElementTree as ET
import numpy as np
import laspy
from pyproj import CRS, Transformer
from shapely.geometry import Polygon, MultiPolygon, box, mapping
from shapely.ops import unary_union

# Origin: HMH's location pin for HUMC (docs/future/3d-campus.md).
LAT0, LON0 = 40.883701, -74.056320
# Area kept in the model, metres from the origin (x east, y north).
HALF = 380
CELL = 1.0
MIN_H = 3.0
MIN_AREA = 120  # m2: smaller pieces of a roof are rooftop equipment, not sections


def to_local(lat, lon):
    """Equirectangular metres around the origin; error is centimetres at this size."""
    k = 111320.0
    return ((lon - LON0) * k * math.cos(math.radians(LAT0)), (lat - LAT0) * 110574.0)


def load_osm(path):
    root = ET.parse(path).getroot()
    nodes = {n.get('id'): to_local(float(n.get('lat')), float(n.get('lon'))) for n in root.iter('node')}
    ways = {}
    for w in root.iter('way'):
        refs = [n.get('ref') for n in w.findall('nd')]
        ways[w.get('id')] = (refs, {t.get('k'): t.get('v') for t in w.findall('tag')}, w)
    buildings, roads = [], []
    def poly(refs):
        pts = [nodes[r] for r in refs if r in nodes]
        return Polygon(pts).buffer(0) if len(pts) >= 4 else None
    for wid, (refs, tags, _) in ways.items():
        if 'building' in tags and refs and refs[0] == refs[-1]:
            p = poly(refs)
            if p is not None and not p.is_empty:
                buildings.append({'osm': 'way/' + wid, 'name': tags.get('name'), 'kind': tags.get('building'), 'poly': p})
        elif 'highway' in tags and tags['highway'] in (
                'primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'service'):
            pts = [nodes[r] for r in refs if r in nodes]
            if len(pts) >= 2:
                roads.append({'osm': 'way/' + wid, 'name': tags.get('name'), 'kind': tags['highway'],
                              'service': tags.get('service'), 'pts': pts})
    for rel in root.iter('relation'):
        tags = {t.get('k'): t.get('v') for t in rel.findall('tag')}
        if tags.get('type') == 'multipolygon' and 'building' in tags:
            outer = [poly(ways[m.get('ref')][0]) for m in rel.findall('member')
                     if m.get('type') == 'way' and m.get('role') == 'outer' and m.get('ref') in ways]
            inner = [poly(ways[m.get('ref')][0]) for m in rel.findall('member')
                     if m.get('type') == 'way' and m.get('role') == 'inner' and m.get('ref') in ways]
            outer = [p for p in outer if p is not None]
            if outer:
                p = unary_union(outer).difference(unary_union([p for p in inner if p is not None]))
                buildings.append({'osm': 'relation/' + rel.get('id'), 'name': tags.get('name'),
                                  'kind': tags.get('building'), 'poly': p})
    area = box(-HALF, -HALF, HALF, HALF)
    buildings = [b for b in buildings if b['poly'].intersects(area)]
    return buildings, roads


def load_lidar(paths, fallback=None):
    """Points inside the model area as local metres: x, y, z (metres above datum), class.
    fallback: EPSG code for files whose header has no CRS (the 2014 Sandy scan: UTM 18N, metres)."""
    xs, ys, zs, cs = [], [], [], []
    for p in paths:
        with laspy.open(p) as f:
            crs = f.header.parse_crs()
            if crs is None:
                if not fallback:
                    sys.exit(f'{p}: no CRS in header, pass --old-crs')
                crs = CRS.from_user_input(fallback)
                horiz, zunit = crs, 1.0
            else:
                horiz = crs.sub_crs_list[0] if crs.is_compound else crs
                zunit = (crs.sub_crs_list[1] if crs.is_compound else crs).axis_info[-1].unit_conversion_factor
            tr = Transformer.from_crs(CRS.from_epsg(4326), horiz, always_xy=True)
            # Bounding box of the model area in the file's CRS.
            corners = []
            for dx in (-HALF, HALF):
                for dy in (-HALF, HALF):
                    lon = LON0 + dx / (111320.0 * math.cos(math.radians(LAT0)))
                    lat = LAT0 + dy / 110574.0
                    corners.append(tr.transform(lon, lat))
            cx = [c[0] for c in corners]; cy = [c[1] for c in corners]
            back = Transformer.from_crs(horiz, CRS.from_epsg(4326), always_xy=True)
            for chunk in f.chunk_iterator(5_000_000):
                x = np.asarray(chunk.x); y = np.asarray(chunk.y)
                m = (x >= min(cx)) & (x <= max(cx)) & (y >= min(cy)) & (y <= max(cy))
                if not m.any():
                    continue
                cls = np.asarray(chunk.classification)[m]
                keep = (cls != 7) & (cls != 18)  # drop noise
                lon, lat = back.transform(x[m][keep], y[m][keep])
                k = 111320.0
                xs.append((lon - LON0) * k * math.cos(math.radians(LAT0)))
                ys.append((lat - LAT0) * 110574.0)
                zs.append(np.asarray(chunk.z)[m][keep] * zunit)
                cs.append(cls[keep])
        print(f'{p}: {crs.name}', file=sys.stderr)
    return np.concatenate(xs), np.concatenate(ys), np.concatenate(zs), np.concatenate(cs)


def grids(x, y, z, c):
    """1 m grids: top = highest return per cell; ground = a filled bare-earth surface."""
    n = int(2 * HALF / CELL)
    ix = np.clip(((x + HALF) / CELL).astype(int), 0, n - 1)
    iy = np.clip(((y + HALF) / CELL).astype(int), 0, n - 1)
    top = np.full((n, n), np.nan)
    np.fmax.at(top, (iy, ix), z)
    g = c == 2
    gsum = np.zeros((n, n)); gcnt = np.zeros((n, n))
    np.add.at(gsum, (iy[g], ix[g]), z[g]); np.add.at(gcnt, (iy[g], ix[g]), 1)
    ground = np.where(gcnt > 0, gsum / np.maximum(gcnt, 1), np.nan)
    return top, fill_ground(ground)


def fill_ground(ground, block=4):
    """Bare earth under buildings has no lidar ground points. Take 4 m block medians, fill
    the gaps from their neighbours outward, then smooth, and return it at 1 m."""
    n = ground.shape[0]; m = n // block
    with warnings.catch_warnings():
        warnings.simplefilter('ignore', RuntimeWarning)
        g = np.nanmedian(ground[:m * block, :m * block].reshape(m, block, m, block), axis=(1, 3))
        while np.isnan(g).any():
            p = np.pad(g, 1, mode='edge')
            nb = np.nanmean(np.stack([p[i:i + m, j:j + m] for i in range(3) for j in range(3)]), axis=0)
            g = np.where(np.isnan(g), nb, g)
        for _ in range(2):
            p = np.pad(g, 1, mode='edge')
            g = np.mean(np.stack([p[i:i + m, j:j + m] for i in range(3) for j in range(3)]), axis=0)
    out = np.repeat(np.repeat(g, block, axis=0), block, axis=1)
    if out.shape[0] < n:
        out = np.pad(out, ((0, n - out.shape[0]), (0, n - out.shape[1])), mode='edge')
    return out


def median3(a, k=3):
    r = k // 2
    p = np.pad(a, r, mode='edge')
    stack = np.stack([p[i:i + a.shape[0], j:j + a.shape[1]] for i in range(k) for j in range(k)])
    return np.nanmedian(stack, axis=0)


def cell_mask(poly, n):
    """Boolean grid of cells whose centre lies inside poly."""
    from shapely import contains_xy
    minx, miny, maxx, maxy = poly.bounds
    i0 = max(int((minx + HALF) / CELL), 0); i1 = min(int((maxx + HALF) / CELL) + 1, n)
    j0 = max(int((miny + HALF) / CELL), 0); j1 = min(int((maxy + HALF) / CELL) + 1, n)
    m = np.zeros((n, n), bool)
    if i1 <= i0 or j1 <= j0:
        return m
    gx, gy = np.meshgrid(-HALF + (np.arange(i0, i1) + 0.5) * CELL, -HALF + (np.arange(j0, j1) + 0.5) * CELL)
    m[j0:j1, i0:i1] = contains_xy(poly, gx, gy)
    return m


def cells_to_poly(mask):
    js, is_ = np.nonzero(mask)
    boxes = [box(-HALF + i * CELL, -HALF + j * CELL, -HALF + (i + 1) * CELL, -HALF + (j + 1) * CELL)
             for j, i in zip(js, is_)]
    return unary_union(boxes) if boxes else None


def smooth(top):
    """roof3: 3x3 median of the top grid (heights); roof5: 5x5 (for banding into sections)."""
    with warnings.catch_warnings():
        warnings.simplefilter('ignore', RuntimeWarning)
        return median3(top), median3(top, 5)


def sections(poly, roofs, ground, step):
    """Height sections inside one footprint, measured from the lowest ground under it (the
    base), so a flat roof on a slope stays one section. Returns (base, [(polygon, h)], stats)."""
    roof, roof5 = roofs
    n = roof.shape[0]
    m = cell_mask(poly, n)
    if m.sum() < 20:
        return None
    base = float(np.min(ground[m]))
    above_local = np.where(m, roof - ground, np.nan)
    covered = np.count_nonzero(~np.isnan(above_local[m])) / max(m.sum(), 1)
    if covered < 0.8:
        return None
    # Bands from the 5x5 median (parapets, rooftop units and edge noise don't make sections).
    hb = np.where(m & (above_local >= MIN_H), roof5 - base, np.nan)
    band = np.round(hb / step) * step
    out = []
    for b in np.unique(band[~np.isnan(band)]):
        cells = band == b
        if cells.sum() * CELL * CELL < MIN_AREA:
            continue
        p = cells_to_poly(cells)
        if p is None:
            continue
        # Close then open by 1.5 m (fills cell notches, drops slivers), straighten, clip.
        p = p.buffer(1.5, join_style='mitre').buffer(-3, join_style='mitre').buffer(1.5, join_style='mitre')
        p = p.simplify(1.2).intersection(poly).buffer(0)
        if p.area >= MIN_AREA:
            out.append((p, float(b)))
    # Each cell belongs to one band, so sections don't overlap; give leftovers (dropped
    # slivers) to nothing: they stay open rather than guessed.
    v = above_local[m]; v = v[~np.isnan(v)]
    stats = {'base_m': round(base, 1), 'ground_span_m': round(float(np.max(ground[m]) - base), 1),
             'cells': int(m.sum()), 'lidar_cover': round(covered, 3),
             'p50_m': round(float(np.percentile(v, 50)), 1), 'p95_m': round(float(np.percentile(v, 95)), 1)}
    return base, out, stats


def terrain(ground, step=8):
    """Coarse terrain for the model: elevations every 8 m, in decimetres above the lowest point."""
    t = ground[step // 2::step, step // 2::step]
    lo = float(np.min(t))
    return {'step_m': step, 'size': t.shape[0], 'origin_m': [-HALF + step / 2, -HALF + step / 2],
            'low_m': round(lo, 1), 'dm': np.round((t - lo) * 10).astype(int).ravel().tolist()}


def rings(p):
    polys = list(p.geoms) if isinstance(p, MultiPolygon) else [p]
    out = []
    for q in polys:
        if q.is_empty or q.geom_type != 'Polygon':
            continue
        out.append({'outer': [[round(x, 1), round(y, 1)] for x, y in q.exterior.coords[:-1]],
                    'holes': [[[round(x, 1), round(y, 1)] for x, y in r.coords[:-1]] for r in q.interiors]})
    return out


# The OSM outline that covers the connected main complex (St. John, Strawbridge, Main,
# Conklin, Schlesinger Pavilion on the 2024 campus map). OSM calls it "Patient Pavilion",
# a name the map doesn't use, so the app never shows that name.
MAIN_COMPLEX = 'way/544168888'


def components(mask):
    """4-connected components of a boolean grid, largest first, as lists of (j, i)."""
    from collections import deque
    seen = np.zeros(mask.shape, bool); out = []
    for j, i in zip(*np.nonzero(mask)):
        if seen[j, i]:
            continue
        q = deque([(j, i)]); seen[j, i] = True; cells = []
        while q:
            a, b = q.popleft(); cells.append((a, b))
            for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                x, y = a + da, b + db
                if 0 <= x < mask.shape[0] and 0 <= y < mask.shape[1] and mask[x, y] and not seen[x, y]:
                    seen[x, y] = True; q.append((x, y))
        out.append(cells)
    return sorted(out, key=len, reverse=True)


def cells_poly(cells, n):
    m = np.zeros((n, n), bool)
    for j, i in cells:
        m[j, i] = True
    p = cells_to_poly(m)
    p = p.buffer(2, join_style='mitre').buffer(-4, join_style='mitre').buffer(2, join_style='mitre')
    p = p.simplify(1.5).buffer(0)
    if isinstance(p, MultiPolygon):  # keep the main piece
        p = max(p.geoms, key=lambda q: q.area)
    return p


def derive(buildings, roofs, ground, oldroofs, oldground):
    """Split the campus where OSM is out of date or too coarse, from the lidar alone:
    new_tower: the largest roof area over 12 m that is 10 m+ taller than in 2014 (the
               only building of its size put up between the scans);
    south_block: the part of the main complex outline over 40 m tall in the new scan, outside
               new_tower (its tall south end, present in both scans);
    main_rest: the rest of the main complex outline.
    Every other OSM outline loses whatever new_tower covers (they were drawn in 2017)."""
    n = roofs[1].shape[0]
    h = roofs[1] - ground
    ho = oldroofs[1] - oldground
    new = (h > 12) & (np.nan_to_num(ho, nan=0) < h - 10)
    comp = components(new)
    tower = cells_poly(comp[0], n)
    main = next(b for b in buildings if b['osm'] == MAIN_COMPLEX)
    mm = cell_mask(main['poly'].difference(tower), n)
    tall = components(mm & (h > 40))
    south = cells_poly(tall[0], n).intersection(main['poly']).difference(tower).buffer(0)
    if isinstance(south, MultiPolygon):
        south = max(south.geoms, key=lambda q: q.area)
    rest = main['poly'].difference(tower).difference(south).buffer(-0.5).buffer(0.5)
    out = []
    for b in buildings:
        if b['osm'] == MAIN_COMPLEX:
            continue
        p = b['poly'].difference(tower).buffer(0) if b['poly'].intersects(tower) else b['poly']
        if p.area >= 60:
            out.append(dict(b, poly=p))
    src = 'lidar: 2023-2025 scan vs 2014 scan'
    out.append({'osm': None, 'id': 'new_tower', 'name': None, 'kind': 'lidar', 'poly': tower,
                'source': src + ', largest area built 10 m+ taller between them'})
    out.append({'osm': None, 'id': 'south_block', 'name': None, 'kind': 'lidar', 'poly': south,
                'source': 'lidar: part of the main complex outline (' + MAIN_COMPLEX + ') over 40 m tall'})
    out.append({'osm': MAIN_COMPLEX, 'id': 'main_rest', 'name': None, 'kind': 'hospital', 'poly': rest,
                'source': 'OSM outline minus new_tower and south_block'})
    print(f'derive: new_tower {tower.area:.0f} m2, south_block {south.area:.0f} m2, main_rest {rest.area:.0f} m2',
          file=sys.stderr)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--osm', required=True)
    ap.add_argument('--new', nargs='+', required=True)
    ap.add_argument('--old', nargs='*', default=[])
    ap.add_argument('--old-crs', default='EPSG:26918', help='CRS for files with none in the header (the 2014 Sandy scan)')
    ap.add_argument('--out')
    ap.add_argument('--step', type=float, default=3.0, help='height band size in metres')
    ap.add_argument('--report', action='store_true')
    ap.add_argument('--grids', help='save the 1 m grids here (.npz, for checks; never commit)')
    a = ap.parse_args()
    buildings, roads = load_osm(a.osm)
    x, y, z, c = load_lidar(a.new, a.old_crs)
    top, ground = grids(x, y, z, c)
    roofs = smooth(top)
    old = None
    if a.old:
        ox, oy, oz, oc = load_lidar(a.old, a.old_crs)
        old = grids(ox, oy, oz, oc)
        oldroofs = smooth(old[0])
    if a.grids:
        np.savez_compressed(a.grids, top=top, ground=ground,
                            oldtop=old[0] if old else np.zeros(1), oldground=old[1] if old else np.zeros(1))
    if old:
        buildings = derive(buildings, roofs, ground, oldroofs, old[1])
    res = []
    for b in buildings:
        s = sections(b['poly'], roofs, ground, a.step)
        if s is None:
            continue
        g, secs, stats = s
        if old:
            so = sections(b['poly'], oldroofs, old[1], a.step)
            stats['p95_2014_m'] = so[2]['p95_m'] if so else None
        item = {'osm': b['osm'], 'id': b.get('id') or b['osm'], 'base': round(g, 1), 'osm_name': b['name'], 'stats': stats,
                'footprint': rings(b['poly']),
                'sections': [{'h': h, 'rings': rings(p)} for p, h in sorted(secs, key=lambda t: t[1])]}
        if b.get('source'):
            item['source'] = b['source']
        res.append(item)
    if a.report:
        for r in sorted(res, key=lambda r: -(r['stats']['p95_m'] or 0)):
            if r['osm_name'] or r['id'] in ('new_tower', 'south_block', 'main_rest') or (r['stats']['p95_m'] or 0) > 15:
                print(r['id'], r['osm_name'], r['stats'], [s['h'] for s in r['sections']])
    if a.out:
        data = {
            'note': 'Generated by tools/campus-heights.py. Do not edit by hand.',
            'origin': {'lat': LAT0, 'lon': LON0, 'units': 'metres, x east, y north'},
            'sources': {
                'footprints': '(c) OpenStreetMap contributors, ODbL, map call fetched 2026-11-19',
                'heights': 'USGS 3DEP lidar NJ_NE6County_B23, flown 2023-2025 (public domain); NJ Sandy lidar, flown 2014, as cross-check',
                'method': 'roof = highest return per 1 m cell, 3x3 median; ground = class-2 returns, 4 m '
                          'block medians, gaps filled from neighbours; sections = roof minus the lowest ground '
                          f'under the footprint, banded to {a.step:g} m; cells under {MIN_H:g} m above local ground are open',
            },
            'terrain': terrain(ground),
            'buildings': res,
            'roads': [{'osm': r['osm'], 'name': r['name'], 'kind': r['kind'], 'service': r['service'],
                       'pts': [[round(px, 1), round(py, 1)] for px, py in r['pts']]}
                      for r in roads if any(abs(px) < HALF and abs(py) < HALF for px, py in r['pts'])],
        }
        json.dump(data, open(a.out, 'w'), separators=(',', ':'))
        print('wrote', a.out, len(res), 'buildings', file=sys.stderr)


if __name__ == '__main__':
    main()
