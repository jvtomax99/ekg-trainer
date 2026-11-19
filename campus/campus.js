// Campus preview (step 5): grey blocks at measured heights on the real streets.
// Data: data/campus.json (made by tools/campus-heights.py, do not edit) and
// data/labels.json (hand-written: only names confirmed in docs/campus/, each with its basis).
// Loaded only on this page; the trainer never imports it.
import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";

const canvas = document.getElementById("campusCanvas");
const status = document.getElementById("campusStatus");
const card = document.getElementById("campusCard");
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function say(text) { status.textContent = text; status.hidden = !text; }

function css(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// Scene colors per theme. Blockout: no textures, flat greys, priorities a touch brighter.
function palette() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return dark ? {
    bg: css("--bg", "#090e13"), ground: "#121b24", road: "#24313e", roadLabel: "#94a4b4",
    key: { "1A": "#d9e1e8", "1B": "#b9c6d2", "1C": "#9fd3e6" }, other: "#3d4955", edge: "#0b1117", pick: css("--brand", "#5aa9ff")
  } : {
    bg: css("--bg", "#f3f6f9"), ground: "#e3e9ef", road: "#c4ced8", roadLabel: "#536477",
    key: { "1A": "#ffffff", "1B": "#e6ecf2", "1C": "#d3eef7" }, other: "#aab5bf", edge: "#6b7987", pick: css("--brand", "#0a64c0")
  };
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(url + " " + res.status);
  return res.json();
}

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
  } catch (e) { return false; }
}

// Local metres (x east, y north) to three.js (x right, y up, z toward the viewer = south).
function shapeFrom(ring) {
  const s = new THREE.Shape(ring.outer.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of ring.holes) s.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  return s;
}

function roadWidth(r) {
  if (r.kind === "secondary" || r.kind === "primary") return 12;
  if (r.kind === "tertiary") return 10;
  if (r.kind === "service") return r.service === "parking_aisle" ? 0 : 4;
  return 7;
}

// Terrain from data.terrain: a grid of elevations (decimetres above the lowest point).
function makeTerrain(t) {
  const n = t.size, st = t.step_m, [ox, oy] = t.origin_m;
  const z = (i, j) => t.dm[Math.min(Math.max(j, 0), n - 1) * n + Math.min(Math.max(i, 0), n - 1)] / 10;
  // Height at local metres (x east, y north), bilinear.
  function at(x, y) {
    const fx = (x - ox) / st, fy = (y - oy) / st;
    const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j;
    return z(i, j) * (1 - u) * (1 - v) + z(i + 1, j) * u * (1 - v) + z(i, j + 1) * (1 - u) * v + z(i + 1, j + 1) * u * v;
  }
  const g = new THREE.PlaneGeometry(st * (n - 1), st * (n - 1), n - 1, n - 1);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  const cx = ox + st * (n - 1) / 2, cy = oy + st * (n - 1) / 2;
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k) + cx, y = -p.getZ(k) + cy;
    p.setXYZ(k, x, at(x, y), -y);
  }
  g.computeVertexNormals();
  return { geometry: g, at };
}

function roadMesh(r, color, at) {
  const w = roadWidth(r) / 2;
  if (!w) return null;
  const pos = [];
  // Split long segments every 6 m so the road follows the ground.
  const pts = [];
  for (let i = 0; i < r.pts.length - 1; i++) {
    const [x1, y1] = r.pts[i], [x2, y2] = r.pts[i + 1];
    const k = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 6));
    for (let s = 0; s < k; s++) pts.push([x1 + (x2 - x1) * s / k, y1 + (y2 - y1) * s / k]);
  }
  pts.push(r.pts[r.pts.length - 1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L * w, ny = dx / L * w;
    const a = [x1 + nx, y1 + ny], b = [x1 - nx, y1 - ny], c = [x2 + nx, y2 + ny], d = [x2 - nx, y2 - ny];
    for (const [x, y] of [a, b, c, b, d, c]) pos.push(x, at(x, y) + 0.3, -y);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
}

function label(text, color) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const px = 44;
  ctx.font = "600 " + px + "px system-ui, -apple-system, sans-serif";
  c.width = Math.ceil(ctx.measureText(text).width) + 16; c.height = px + 16;
  ctx.font = "600 " + px + "px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = color; ctx.textBaseline = "middle"; ctx.fillText(text, 8, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const h = 9;
  sp.scale.set(h * c.width / c.height, h, 1);
  sp.renderOrder = 10;
  return sp;
}

async function main() {
  if (!webglOK()) { say("This phone's browser can't show 3D here. The trainer works as usual."); return; }
  let data, labels;
  try {
    [data, labels] = await Promise.all([getJSON("data/campus.json"), getJSON("data/labels.json")]);
  } catch (e) {
    say("The campus couldn't load. Open it once with a connection; after that it works offline.");
    return;
  }
  const P = palette();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(P.bg);
  const camera = new THREE.PerspectiveCamera(40, 1, 5, 4000);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(-300, 500, 200);
  scene.add(sun);

  const terrain = makeTerrain(data.terrain);
  const low = data.terrain.low_m;
  scene.add(new THREE.Mesh(terrain.geometry, new THREE.MeshLambertMaterial({ color: P.ground })));

  for (const r of data.roads) { const m = roadMesh(r, P.road, terrain.at); if (m) scene.add(m); }

  // Street names: only the streets named in docs/future/3d-campus.md, once each, at mid-length.
  const named = new Map();
  for (const r of data.roads) {
    if (!r.name || !labels.streets.includes(r.name)) continue;
    const L = r.pts.length;
    if (!named.has(r.name) || L > named.get(r.name).pts.length) named.set(r.name, r);
  }
  for (const [name, r] of named) {
    const [x, y] = r.pts[Math.floor(r.pts.length / 2)];
    const sp = label(name, P.roadLabel);
    sp.position.set(x, terrain.at(x, y) + 4, -y);
    scene.add(sp);
  }

  const pickable = [];
  const keyMat = {};
  for (const k in P.key) keyMat[k] = new THREE.MeshLambertMaterial({ color: P.key[k] });
  const otherMat = new THREE.MeshLambertMaterial({ color: P.other });
  const edgeMat = new THREE.LineBasicMaterial({ color: P.edge, transparent: true, opacity: 0.55 });
  const focus = new THREE.Box3();
  for (const b of data.buildings) {
    const info = labels.buildings[b.id] || null;
    const key = !!(info && info.priority);
    const group = new THREE.Group();
    for (const s of b.sections) {
      for (const ring of s.rings) {
        // From 2 m below the lowest ground under the footprint (so slopes don't show a gap).
        const geo = new THREE.ExtrudeGeometry(shapeFrom(ring), { depth: s.h + 2, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2); // shape y (north) -> -z, depth -> up
        geo.translate(0, b.base - low - 2, 0);
        const base = key ? keyMat[info.priority] : otherMat;
        const mesh = new THREE.Mesh(geo, base);
        mesh.userData = { building: b, info, base };
        group.add(mesh);
        if (key) group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat));
        pickable.push(mesh);
      }
    }
    scene.add(group);
    if (key) focus.expandByObject(group);
  }

  // First view: from the south-west, the priority buildings filling the frame.
  const center = focus.isEmpty() ? new THREE.Vector3() : focus.getCenter(new THREE.Vector3());
  center.y = focus.isEmpty() ? 0 : focus.min.y;
  const size = focus.isEmpty() ? 300 : focus.getSize(new THREE.Vector3()).length();
  // Portrait phones see less width, so start further back.
  const aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
  const fit = aspect < 1 ? Math.pow(1 / aspect, 0.7) : 1;
  camera.position.set(center.x - size * 0.7 * fit, size * 0.9 * fit, center.z + size * 0.95 * fit);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(center);
  controls.enableDamping = !reduceMotion;
  controls.dampingFactor = 0.12;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minDistance = 60;
  controls.maxDistance = 1100;
  controls.screenSpacePanning = false;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.update();

  // Render only when something changes (battery).
  let pending = false;
  function render() { pending = false; if (controls.update()) request(); renderer.render(scene, camera); }
  function request() { if (!pending) { pending = true; requestAnimationFrame(render); } }
  controls.addEventListener("change", request);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    request();
  }
  new ResizeObserver(resize).observe(canvas);

  // Tap a building: a press that barely moves.
  const ray = new THREE.Raycaster();
  let down = null, picked = null;
  canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || performance.now() - down.t > 600) return;
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(pickable, false)[0];
    select(hit ? hit.object.userData : null);
  });
  document.getElementById("cardClose").addEventListener("click", () => select(null));

  const pickMat = new THREE.MeshLambertMaterial({ color: P.pick });
  function select(d) {
    if (picked) for (const m of pickable) if (m.userData.building === picked) m.material = m.userData.base;
    picked = d ? d.building : null;
    if (!d) { card.hidden = true; request(); return; }
    for (const m of pickable) if (m.userData.building === picked) m.material = pickMat;
    const b = d.building, info = d.info;
    document.getElementById("cardName").textContent = info ? info.name : "Campus building";
    document.getElementById("cardWhat").textContent = info ? info.what : "Name not confirmed yet, so none is shown.";
    // p50 / p95: roof height above the ground right beside it, from the lidar.
    document.getElementById("cardHeight").textContent =
      "Roof mostly about " + Math.round(b.stats.p50_m) + " m up, highest parts about " + Math.round(b.stats.p95_m) + " m.";
    document.getElementById("cardBasis").textContent = (info && info.basis ? info.basis + " " : "") +
      "Height measured from USGS lidar (" + (b.stats.lidar_cover * 100).toFixed(0) + "% of the footprint covered).";
    card.hidden = false;
    request();
  }

  say("");
  resize();
  // For tools/campus-check.js: triangle count and a way to tap a building by id.
  window.__campus = {
    triangles: () => { let t = 0; scene.traverse((o) => { if (o.isMesh) t += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); return Math.round(t); },
    // A screen point where this building is the first thing a tap would hit, or null.
    screenOf: (id) => {
      const r = canvas.getBoundingClientRect();
      const v = new THREE.Vector3();
      for (const m of pickable.filter((x) => x.userData.building.id === id)) {
        const pos = m.geometry.attributes.position;
        for (let k = 0; k < pos.count; k += 7) {
          v.fromBufferAttribute(pos, k).applyMatrix4(m.matrixWorld).project(camera);
          if (Math.abs(v.x) > 0.9 || Math.abs(v.y) > 0.9) continue;
          // Nudge toward the mesh centre so the point is on a face, not an edge.
          const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).project(camera);
          const ndc = new THREE.Vector2(v.x * 0.8 + c.x * 0.2, v.y * 0.8 + c.y * 0.2);
          ray.setFromCamera(ndc, camera);
          const hit = ray.intersectObjects(pickable, false)[0];
          if (hit && hit.object.userData.building.id === id) {
            return { x: r.left + (ndc.x + 1) / 2 * r.width, y: r.top + (1 - ndc.y) / 2 * r.height };
          }
        }
      }
      return null;
    }
  };
}

main().catch((e) => { console.error(e); say("The campus couldn't start. The trainer works as usual."); });
