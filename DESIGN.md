# DESIGN: look and feel

Inspiration: a bedside cardiac monitor at night. Black screen, glowing trace, bright
numbers, nothing else competing. Calm until something is wrong.

## Visual direction (owner, 2026-11-19, revised)
A premium healthcare-tech product: bright and clinical by day, calm and low-glare at night.
Inspired by modern hospital software in general; no HMH logos, names, colors lifted from
their brand guide, or anything that implies endorsement. The app shell and the ECG strip
are themed separately so the shell can be polished while strips stay realistic.

## App themes (CSS variables on `:root`, `data-theme="light|dark"`)
Set by `js/theme.js` from `ekg.prefs.v1.theme`: `system` (default), `light`, `dark`.

| Variable | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f3f6f9` | `#090e13` | page |
| `--surface` | `#ffffff` | `#111a22` | cards, sheets |
| `--surface-2` / `-3` | `#f2f5f8` / `#e2e8ee` | `#17212b` / `#202c38` | inputs, tracks |
| `--line` / `--line-soft` | `#d3dce5` / `#e3e9ef` | `#263442` / `#1a2530` | borders |
| `--text` | `#0f1d2b` | `#e2e9ef` | main text |
| `--muted` | `#536477` | `#94a4b4` | secondary text |
| `--brand` | `#0a64c0` | `#5aa9ff` | active tab, links, focus, selected |
| `--brand-2` | `#0a7f88` | `#35c6c9` | teal companion, brand mark |
| `--brand-grad` | `#0a64c0 → #08757e` | `#2a6fd0 → #0f7a82` | primary buttons, bars, timer |
| `--orange` / `--orange-text` | `#f26a1b` / `#a84508` | `#ff8a3d` / `#ff9c5c` | accent only: active-tab dot, intro progress, greeting, the icon's pen dot, future mastery glow |
| `--ok` | `#0f7343` | `#3fd98a` | correct, accuracy 85%+ |
| `--danger` | `#c42a3c` | `#ff6b78` | wrong, lethal |
| `--warn` | `#8f5b00` | `#ffc53d` | "pending nurse review", low accuracy |

Rules: green and red mean right and wrong only; amber means caution only; orange is never a
status color. Never color alone: correct / wrong also get an icon and a word. Every text pair
is 4.5:1 or better in both themes (checked in step 2b; white on the button gradient 5.4+).

## Strip themes (`data-strip="paper|green|amber"`), independent of the app theme
`ekg.prefs.v1.strip`: `auto` (paper in light, green in dark), `paper`, `green`, `amber`.

| | Paper | Green monitor | Amber monitor |
|---|---|---|---|
| background | `#fffafa` | `#050807` | `#070604` |
| 1 mm / 5 mm grid | `#f7dbdf` / `#e79aa5` | `#0f1a16` / `#1c2c26` | `#1a150d` / `#2d2416` |
| trace | `#15181c` ink | `#3cf08c` | `#ffb020` |
| calipers | `#0a64c0` | `#7cc4ff` | `#7cc4ff` |

Live sweeps (Home header, Monitor view) always look like a monitor: green, or amber when
the amber strip theme is chosen. Scale never changes: 25 mm/s, 10 mm/mV.
A high-contrast strip theme is a later option.

## Type
- System fonts only (offline, no downloads): `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Numbers on strips and vitals: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`,
  with `font-variant-numeric: tabular-nums`.
- Scale (`--fs-*`): xs 12, sm 14, base 17 (body, buttons), md 19 (verdict, group names),
  lg 22 (screen titles), xl 28 (hero, intro titles), 2xl 34, display 48 (exam score).
  Line height 1.45 for text, 1.2 for headings. SF Pro on iPhone via `system-ui`.

## Tokens (step 2b)
- Space, 4 px grid: `--sp-1` 4, `--sp-2` 8, `--sp-3` 12, `--sp-4` 16, `--sp-5` 20, `--sp-6` 24, `--sp-8` 32.
- Radius: `--r-sm` 10, `--r-md` 14 (buttons, choices), `--r-lg` 20 (cards), `--r-xl` 28 (sheets), `--r-pill`.
- Elevation: `--hairline` (1 px top highlight), `--elev-1` (cards), `--elev-2` (sheets, intro
  screenshots), `--glow-trace` (primary button only).
- Motion: `--dur-1` 120 ms (press), `--dur-2` 200 ms (color, tab pill), `--dur-3` 320 ms
  (view and feedback entrance), `--dur-4` 700 ms (bars); rings fill in 900 ms.
  Easing `--ease-out` cubic-bezier(.2,.8,.2,1); `--ease-spring` cubic-bezier(.34,1.4,.64,1) for
  the tab icon press.

## Icons
- One inline SVG sprite in `index.html` (`<symbol id="i-…">`), 24 px grid, 1.75 stroke,
  round caps and joins, `currentColor`. No icon libraries, no emoji. Use
  `<svg class="ic"><use href="#i-name"/></svg>`; decorative icons are `aria-hidden`, icon-only
  buttons carry `aria-label`.
- Set: home, learn, practice, exam, progress, sinus, atrial, junctional, ventricular, blocks,
  measure, zoom, expand, timer, review, mastery, achievement, lethal, sources, about,
  settings, monitor, campus, check, x, chevron, play, share, addhome, more.
- Group icons are tiny waveforms (sinus P-QRS-T, flutter sawtooth, junctional inverted P,
  wide ventricular complex, P waves with a dropped beat).

## Strip
- Real scale: 25 mm/s, 10 mm/mV. 1 small box = 0.04 s, 1 big box = 0.20 s.
- Default view: 6-second lead II strip, full phone width, about 180 px tall.
- Trace 2 px, `--trace`, slight glow (shadow blur 4 px) only on the live sweep.
- Live mode: sweep left to right with a small erase gap, like a monitor.
- Calipers: two draggable vertical lines with the gap shown in seconds and small boxes.
- HR readout top right in `--trace`, monospace. Hidden during quizzes.

## Layout
- One column, 16 px side padding, max width 560 px centered on bigger screens.
- Bottom tab bar (thumb reach): Home, Learn, Practice, Exam, Progress. 60 px tall plus the
  safe area; the active tab gets a green pill behind its icon.
- Answer buttons: full width, at least 48 px tall, 10 px gap, big enough for gloves.
- Feedback slides up from the bottom: verdict, the rhythm's 5 criteria, why the other
  choices were wrong, source tag.
- No horizontal scroll at 360 px. Respect the iPhone safe areas.

## Motion
- Short and quiet. Primary buttons carry a slow sheen every few seconds; the intro icon floats
  gently; the active tab gets an orange dot that pops in. View change: 320 ms fade and 8 px rise. Correct answer: one green pulse
  ring. Wrong answer: a 380 ms shake. Press: scale to 0.97. Progress rings and bars fill once.
  No confetti, no streak pressure.
- `prefers-reduced-motion` turns every animation and transition off; live sweeps (Home
  header, Monitor view) become static strips.

## Sound
- Off by default. Optional soft beep per QRS in live mode, phase 7.

## App icon (step 2b, revised)
Drawn in code by `tools/make-icons.js` (one SVG master, PNGs rendered with the local
Chromium): blue-to-teal tile (`#0b5cb5 → #078a92`) with a soft highlight and faint white
1 mm / 5 mm grid; one white lead II P-QRS-T with a cool glow and textbook proportions
(1 unit = 1 ms: P 108, PR 164, QRS 84, QT 380), written by an orange "pen" dot like a
monitor sweep, with the previous sweep dimmed past the erase gap. No text, no hearts,
no branding.
Files in `icons/`: `icon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`,
`icon-maskable.svg` / `icon-maskable-512.png` (complex scaled to 74% so it sits inside the
80% safe circle, baseline still runs edge to edge), `favicon.svg` (rounded, thicker
stroke) and `favicon-32.png`. Re-run the script after any change.

## Old icon prompt for ChatGPT (superseded by the coded icon, kept for reference)
"App icon, 1024x1024, flat and minimal. Near-black background (#07090a). A single glowing
monitor-green (#3cf08c) EKG heartbeat line running across the middle, one clean P-QRS-T
complex, with a soft glow. A faint dark red grid behind it. No text, no hearts, no
stethoscopes, no gradients except the glow. Must read clearly at 60x60 px. Rounded-square
safe area."
