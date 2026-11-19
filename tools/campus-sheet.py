#!/usr/bin/env python3
"""Draws docs/campus/nurse-sheet.svg from campus/data/campus.json: a top-down plan of the
main hospital, the south tower and Helena Theurer Pavilion under a 20 m grid (columns
A, B, C..., rows 1, 2, 3...), so the nurse can say which squares are St. John.
Our own drawing from OpenStreetMap outlines (ODbL) and USGS lidar heights; not HMH's map.
Run: python3 tools/campus-sheet.py   (no packages needed)
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(ROOT, 'campus/data/campus.json')))

X0, X1, Y0, Y1 = -60, 220, -160, 120  # metres, x east, y north (multiples of the grid)
S = 2.5  # px per metre
G = 20  # grid size, metres
W, H = (X1 - X0) * S, (Y1 - Y0) * S


def pt(x, y):
    return f'{(x - X0) * S:.1f},{(Y1 - y) * S:.1f}'


def path(ring):
    d = 'M' + ' L'.join(pt(x, y) for x, y in ring['outer']) + ' Z'
    for h in ring['holes']:
        d += ' M' + ' L'.join(pt(x, y) for x, y in h) + ' Z'
    return d


out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H + 150:.0f}" font-family="system-ui, sans-serif">',
       f'<rect width="{W:.0f}" height="{H + 150:.0f}" fill="#ffffff"/>']
for r in data['roads']:
    if r['kind'] == 'service':
        continue
    out.append('<polyline fill="none" stroke="#d3dce5" stroke-width="{:.0f}" stroke-linecap="round" points="{}"/>'.format(
        (10 if r['kind'] in ('tertiary', 'secondary') else 6) * S, ' '.join(pt(x, y) for x, y in r['pts'])))
for name, (x, y, rot) in {'Atlantic St': (40, 104, -34), '2nd St': (150, -60, -66)}.items():
    px, py = pt(x, y).split(',')
    out.append(f'<text x="{px}" y="{py}" font-size="14" fill="#536477" transform="rotate({rot} {px} {py})">{name}</text>')

shade = {'main_rest': '#ffffff', 'south_block': '#c4ced8', 'new_tower': '#bfe3f0'}
for b in data['buildings']:
    fill, stroke = (shade[b['id']], '#0f1d2b') if b['id'] in shade else ('#eef2f5', '#c4ced8')
    for ring in b['footprint']:
        out.append(f'<path d="{path(ring)}" fill="{fill}" stroke="{stroke}" stroke-width="{1.4 if b["id"] in shade else 1}"/>')

# 20 m grid with column letters and row numbers.
cols = list(range(X0, X1, G)); rows = list(range(Y1, Y0, -G))
for x in range(X0, X1 + 1, G):
    out.append(f'<line x1="{(x - X0) * S:.0f}" y1="0" x2="{(x - X0) * S:.0f}" y2="{H:.0f}" stroke="#0a64c0" stroke-opacity="0.35" stroke-width="1"/>')
for y in range(Y0, Y1 + 1, G):
    out.append(f'<line x1="0" y1="{(Y1 - y) * S:.0f}" x2="{W:.0f}" y2="{(Y1 - y) * S:.0f}" stroke="#0a64c0" stroke-opacity="0.35" stroke-width="1"/>')
for k, x in enumerate(cols):
    out.append(f'<text x="{(x - X0 + G / 2) * S:.0f}" y="14" font-size="12" font-weight="700" text-anchor="middle" fill="#0a64c0">{chr(65 + k)}</text>')
for k, y in enumerate(rows):
    out.append(f'<text x="4" y="{(Y1 - y + G / 2) * S + 4:.0f}" font-size="12" font-weight="700" fill="#0a64c0">{k + 1}</text>')

# North arrow and scale.
out.append(f'<g transform="translate({W - 30:.0f},44)"><circle r="20" fill="#fff"/><path d="M0,-16 L7,6 L0,1 L-7,6 Z" fill="#0f1d2b"/>'
           '<text y="18" font-size="11" text-anchor="middle">N</text></g>')
out.append(f'<rect x="20" y="{H - 40:.0f}" width="{50 * S + 20:.0f}" height="30" fill="#fff"/>'
           f'<line x1="30" y1="{H - 16:.0f}" x2="{30 + 50 * S:.0f}" y2="{H - 16:.0f}" stroke="#0f1d2b" stroke-width="2"/>'
           f'<text x="30" y="{H - 22:.0f}" font-size="12">50 m</text>')
y = H + 26
for color, text in [('#ffffff', 'Main hospital: St. John, Strawbridge, Main, Conklin (north to south on the 2024 map)'),
                    ('#c4ced8', 'South tower, about 47 m tall: likely Schlesinger Pavilion'),
                    ('#bfe3f0', 'Helena Theurer Pavilion, about 52 m tall')]:
    out.append(f'<rect x="16" y="{y - 12:.0f}" width="16" height="14" fill="{color}" stroke="#0f1d2b"/>'
               f'<text x="40" y="{y:.0f}" font-size="13" fill="#0f1d2b">{text}</text>')
    y += 22
for line in ['Which squares are St. John (for example C4, D4)? Which side does 5 St. John face?',
             'Is the grey south tower "the Pavilion"? Anything here that looks wrong?',
             'Own drawing: outlines (c) OpenStreetMap contributors (ODbL), heights from USGS lidar. Not an HMH map.']:
    out.append(f'<text x="16" y="{y:.0f}" font-size="13" fill="#0f1d2b">{line}</text>')
    y += 22
out.append('</svg>')
os.makedirs(os.path.join(ROOT, 'docs/campus'), exist_ok=True)
open(os.path.join(ROOT, 'docs/campus/nurse-sheet.svg'), 'w').write('\n'.join(out))
print('wrote docs/campus/nurse-sheet.svg')
