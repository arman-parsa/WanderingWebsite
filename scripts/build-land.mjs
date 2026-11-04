#!/usr/bin/env node
/**
 * Build the globe's land data from Natural Earth.
 *
 *   Usage:   node scripts/build-land.mjs /path/to/ne_50m_land.geojson
 *   Output:  public/data/land.json
 *
 * Source:   https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson
 *           (public domain). The 50m set is used rather than 110m because 110m
 *           drops small islands entirely — the Azores, Madeira, the Canaries,
 *           Cape Verde, the Faroes, etc.
 *
 * - Keeps only exterior rings (GlobeView ignores holes)
 * - Douglas–Peucker simplification at TOLERANCE degrees (~1px at max zoom)
 * - Rounds coordinates to 2 decimals (~1km) to keep the file small
 * - Never simplifies a ring away: small islands keep at least a triangle
 */
import fs from 'node:fs';
import path from 'node:path';

const TOLERANCE = 0.02; // degrees
const round = (n) => Math.round(n * 100) / 100;

const arg = process.argv[2];
if (!arg || !fs.existsSync(arg)) {
  console.error('Usage: node scripts/build-land.mjs <ne_50m_land.geojson>');
  process.exit(1);
}

function perpDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function simplify(pts) {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let maxD = 0, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = perpDist(pts[i], pts[s], pts[e]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > TOLERANCE && idx !== -1) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

function cleanRing(ring) {
  // Round + drop consecutive duplicates; ring stays closed (last === first).
  const dedupe = (r) => {
    const out = [];
    for (const [x, y] of r) {
      const p = [round(x), round(y)];
      const last = out[out.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
    }
    return out;
  };
  const full = dedupe(ring);
  if (full.length < 4) return null; // degenerate even at full detail
  // A closed ring has first === last, which DP can't split; split at the
  // farthest point from the start and simplify both halves.
  let far = 1, farD = 0;
  for (let i = 1; i < full.length - 1; i++) {
    const d = Math.hypot(full[i][0] - full[0][0], full[i][1] - full[0][1]);
    if (d > farD) { farD = d; far = i; }
  }
  const simp = [...simplify(full.slice(0, far + 1)).slice(0, -1), ...simplify(full.slice(far))];
  // Tiny islands: fall back to full detail rather than vanish.
  return simp.length >= 4 ? simp : full;
}

const src = JSON.parse(fs.readFileSync(arg, 'utf8'));
const features = [];
let rings = 0, points = 0;
for (const f of src.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const poly of polys) {
    const ring = cleanRing(poly[0]);
    if (!ring) continue;
    features.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } });
    rings++; points += ring.length;
  }
}

const outPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../public/data/land.json');
fs.writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`${rings} rings, ${points} points → ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);
