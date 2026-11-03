'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import ArticlePanel from './ArticlePanel';

export type GlobeItem = {
  _type: string;
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  description?: string;
  coordinates: { lat: number; lng: number };
};

type GeoRing = number[][];
type GeoPolygonCoords = GeoRing[];
type GeoMultiPolygonCoords = GeoPolygonCoords[];

type GeoGeometry =
  | { type: 'Polygon'; coordinates: GeoPolygonCoords }
  | { type: 'MultiPolygon'; coordinates: GeoMultiPolygonCoords }
  | { type: string; coordinates: unknown };

type GeoFeature = { type: string; geometry: GeoGeometry };
type GeoCollection = { type: string; features: GeoFeature[] };

export type Cluster = {
  lat: number;
  lng: number;
  items: GlobeItem[];
};

// ── Constants ───────────────────────────────────────────────────────────────

const GLOBE_RADIUS = 1.0;
const LAND_RADIUS = 1.008;
const ATMO_RADIUS = 1.06;
const PIN_RADIUS = 0.012;
const CLUSTER_THRESHOLD = 0.5;
const AUTO_ROT_SPEED = (2 * Math.PI) / 30;
const MOMENTUM_DECAY = 0.92;
const INACTIVITY_DELAY = 5000;
const CAM_INIT_Z = 2.8;
const CAM_MIN_Z = 1.5;
const CAM_MAX_Z = 5.0;
const PANEL_SHIFT = 170;
const EARTH_TILT = 0.41;   // ~23.5° — natural axial tilt, starting orientation
const TILT_MIN   = -1.22;  // ~-70° — reveals south pole
const TILT_MAX   =  1.22;  // ~+70° — reveals north pole

// ── Geometry helpers ────────────────────────────────────────────────────────

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Recursively subdivide a flat earcut triangle (in lng/lat space) until every
// edge spans ≤ MAX_TRI_SPAN degrees, then project each leaf triangle onto the
// sphere. Without subdivision, large-country triangles form flat chords that
// dip below the ocean sphere surface — the ocean occludes them as holes.
//
// The split decision is made per EDGE (from that edge's own length), never per
// triangle, so the two triangles sharing an edge always split it at the same
// midpoint. Deciding per triangle left T-junctions: one side cut the edge, the
// other drew it straight, and once projected onto the sphere the lng/lat
// midpoint sits off that straight chord — opening wedge-shaped cracks through
// which the ocean showed.
const MAX_TRI_SPAN = 4;
const MAX_SUBDIV_DEPTH = 24; // safety net; real triangles stop far sooner

type LL = readonly [number, number]; // [lng, lat]

const isLongEdge = (a: LL, b: LL) =>
  Math.abs(a[0] - b[0]) > MAX_TRI_SPAN || Math.abs(a[1] - b[1]) > MAX_TRI_SPAN;
// (a+b)/2 === (b+a)/2 exactly in floating point, so both neighbours of an
// edge compute bit-identical midpoints regardless of winding.
const mid = (a: LL, b: LL): LL => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

function emitTri(a: LL, b: LL, c: LL, out: number[], depth: number): void {
  const ab = isLongEdge(a, b), bc = isLongEdge(b, c), ca = isLongEdge(c, a);
  const longCount = +ab + +bc + +ca;

  if (longCount === 0 || depth >= MAX_SUBDIV_DEPTH) {
    for (const [lng, lat] of [a, b, c]) {
      const v = latLngToVec3(lat, lng, LAND_RADIUS);
      out.push(v.x, v.y, v.z);
    }
    return;
  }
  const d = depth + 1;
  if (longCount === 3) {
    const mab = mid(a, b), mbc = mid(b, c), mca = mid(c, a);
    emitTri(a, mab, mca, out, d);
    emitTri(mab, b, mbc, out, d);
    emitTri(mca, mbc, c, out, d);
    emitTri(mab, mbc, mca, out, d);
    return;
  }
  // Rotate (keeping winding) so the long edge(s) come first: x→y is long, and
  // for two long edges y→z is long too.
  let x = a, y = b, z = c;
  if (longCount === 1) {
    if (bc) { x = b; y = c; z = a; } else if (ca) { x = c; y = a; z = b; }
    const m = mid(x, y);
    emitTri(x, m, z, out, d);
    emitTri(m, y, z, out, d);
  } else {
    if (!ab) { x = b; y = c; z = a; } else if (!bc) { x = c; y = a; z = b; }
    const mxy = mid(x, y), myz = mid(y, z);
    emitTri(mxy, y, myz, out, d);
    emitTri(x, mxy, myz, out, d);
    emitTri(x, myz, z, out, d);
  }
}

function subdivideAndEmit(
  lng0: number, lat0: number,
  lng1: number, lat1: number,
  lng2: number, lat2: number,
  out: number[]
): void {
  emitTri([lng0, lat0], [lng1, lat1], [lng2, lat2], out, 0);
}

// Earcut (inside triangulateShape) produces many needle-thin triangles that
// stretch across whole continents. Wrapped onto the sphere, a needle's two
// long sides bend by slightly different amounts, so it folds over itself and
// leaves a hairline of ocean showing. Flipping every interior edge that fails
// the Delaunay test (Lawson flips) turns those needles into well-shaped
// triangles. Coastline edges are never flipped, so the outline is unchanged.
function delaunayRefine(pts: GeoRing, faces: number[][]): void {
  const n = pts.length;
  const orient = (a: number, b: number, c: number) =>
    (pts[b][0] - pts[a][0]) * (pts[c][1] - pts[a][1]) -
    (pts[b][1] - pts[a][1]) * (pts[c][0] - pts[a][0]);
  // > 0 when d lies strictly inside the circumcircle of CCW triangle abc.
  const inCircle = (a: number, b: number, c: number, d: number) => {
    const [dx, dy] = pts[d];
    const ax = pts[a][0] - dx, ay = pts[a][1] - dy;
    const bx = pts[b][0] - dx, by = pts[b][1] - dy;
    const cx = pts[c][0] - dx, cy = pts[c][1] - dy;
    return (ax * ax + ay * ay) * (bx * cy - cx * by) -
           (bx * bx + by * by) * (ax * cy - cx * ay) +
           (cx * cx + cy * cy) * (ax * by - bx * ay);
  };
  const key = (u: number, v: number) => (u < v ? u * n + v : v * n + u);
  const ccw = (f: number[]) => { if (orient(f[0], f[1], f[2]) < 0) [f[1], f[2]] = [f[2], f[1]]; };

  const edgeFaces = new Map<number, number[]>();
  const link = (u: number, v: number, fi: number) => {
    const k = key(u, v);
    const list = edgeFaces.get(k);
    if (list) list.push(fi); else edgeFaces.set(k, [fi]);
  };
  const relink = (u: number, v: number, from: number, to: number) => {
    const list = edgeFaces.get(key(u, v));
    if (list) list[list.indexOf(from)] = to;
  };
  faces.forEach((f, fi) => {
    ccw(f);
    link(f[0], f[1], fi); link(f[1], f[2], fi); link(f[2], f[0], fi);
  });

  const isCoast = (k: number) => {
    const u = Math.floor(k / n), v = k % n;
    return v - u === 1 || (u === 0 && v === n - 1);
  };
  const stack = [...edgeFaces.keys()];
  let budget = faces.length * 50; // flips always terminate; this is a guard
  while (stack.length && budget-- > 0) {
    const k = stack.pop() as number;
    const fs = edgeFaces.get(k);
    if (!fs || fs.length !== 2 || isCoast(k)) continue;
    const a = Math.floor(k / n), b = k % n;
    const [f1, f2] = fs;
    const c = faces[f1].find((v) => v !== a && v !== b) as number;
    const d = faces[f2].find((v) => v !== a && v !== b) as number;
    const [p, q, r] = faces[f1];
    if (inCircle(p, q, r, d) <= 1e-12) continue;
    // Only flip a convex quad: a and b must lie on opposite sides of c–d.
    if (orient(c, d, a) * orient(c, d, b) >= 0) continue;

    faces[f1] = [c, a, d]; ccw(faces[f1]);
    faces[f2] = [c, d, b]; ccw(faces[f2]);
    edgeFaces.delete(k);
    edgeFaces.set(key(c, d), [f1, f2]);
    relink(a, d, f2, f1);
    relink(b, c, f1, f2);
    stack.push(key(a, c), key(a, d), key(b, c), key(b, d));
  }
}

function buildLandGeometry(geojson: GeoCollection): THREE.BufferGeometry {
  const verts: number[] = [];

  function processRing(ring: GeoRing): void {
    const n = ring.length - 1; // closed ring: last === first
    if (n < 3) return;

    // Skip polygons that cross the antimeridian — their 2D projection wraps
    // around the flat map and produces triangles spanning huge areas of the globe.
    for (let i = 0; i < n; i++) {
      if (Math.abs(ring[(i + 1) % n][0] - ring[i][0]) > 180) return;
    }

    const pts = ring.slice(0, n);
    const faces = THREE.ShapeUtils.triangulateShape(
      pts.map(([lng, lat]) => new THREE.Vector2(lng, lat)),
      []
    );
    delaunayRefine(pts, faces);

    for (const [a, b, c] of faces) {
      subdivideAndEmit(
        pts[a][0], pts[a][1],
        pts[b][0], pts[b][1],
        pts[c][0], pts[c][1],
        verts
      );
    }
  }

  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;
    if (type === 'Polygon') {
      processRing((coordinates as GeoPolygonCoords)[0]);
    } else if (type === 'MultiPolygon') {
      for (const poly of coordinates as GeoMultiPolygonCoords) {
        processRing(poly[0]);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(verts);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // Land lies on a sphere, so the true surface normal is the radial direction.
  // Per-face normals (computeVertexNormals on unindexed data) made every
  // triangle shade slightly differently — a faceted, patchy look.
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    const len = Math.hypot(x, y, z) || 1;
    normals[i] = x / len; normals[i + 1] = y / len; normals[i + 2] = z / len;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  return geo;
}


function clusterItems(items: GlobeItem[]): Cluster[] {
  const clusters: Cluster[] = [];
  for (const item of items) {
    let placed = false;
    for (const cl of clusters) {
      if (
        Math.abs(item.coordinates.lat - cl.lat) < CLUSTER_THRESHOLD &&
        Math.abs(item.coordinates.lng - cl.lng) < CLUSTER_THRESHOLD
      ) {
        cl.items.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push({ lat: item.coordinates.lat, lng: item.coordinates.lng, items: [item] });
    }
  }
  return clusters;
}

// ── Interaction state (mutable, lives outside React) ────────────────────────

type InteractState = {
  isDragging: boolean;
  isAutoRotating: boolean;
  lastX: number;
  lastY: number;
  velX: number;
  velY: number;
  inactivityTimer: ReturnType<typeof setTimeout> | null;
  pinchDist: number;
  reducedMotion: boolean;
  tiltAngle: number;
  spinQ: THREE.Quaternion;
};

// ── Component ────────────────────────────────────────────────────────────────

export default function GlobeView({ items }: { items: GlobeItem[] }) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Cluster | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  // Faint "Drag to explore" hint — gone on the first touch of the globe.
  const [showHint, setShowHint] = useState(true);

  const panelRef = useRef<Cluster | null>(null);
  // The keyboard place button that opened the panel — focus returns to it.
  const placeTriggerRef = useRef<HTMLButtonElement | null>(null);

  const handlePanelClose = useCallback(() => {
    setPanel(null);
    panelRef.current = null;
    placeTriggerRef.current?.focus({ preventScroll: true });
    placeTriggerRef.current = null;
  }, []);

  // Same clusters as the pins, for the keyboard / screen-reader place list.
  const places = useMemo(() => clusterItems(items), [items]);

  // Lets the nav switch its menu button to ink over the cream desktop panel.
  useEffect(() => {
    document.body.classList.toggle('globe-panel-open', !!panel && !isMobile);
    return () => document.body.classList.remove('globe-panel-open');
  }, [panel, isMobile]);

  // Escape closes the panel.
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handlePanelClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, handlePanelClose]);

  // Track mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const tooltipEl = tooltipRef.current;
    if (!wrap) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Renderer ────────────────────────────────────────────────────────
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.z = CAM_INIT_Z;

    // ── Lights ───────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffeedd, 0.45));
    const dirLight = new THREE.DirectionalLight(0xfff5e4, 1.8);
    dirLight.position.set(-2.5, 3, 2);
    scene.add(dirLight);

    // ── Globe group ──────────────────────────────────────────────────────
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const oceanMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.95, metalness: 0 })
    );
    globeGroup.add(oceanMesh);

    // Atmosphere
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(ATMO_RADIUS, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf4ede4,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        depthWrite: false,
      })
    ));

    // ── Star field ───────────────────────────────────────────────────────
    const STAR_COUNT = 1800;
    const sPosArr   = new Float32Array(STAR_COUNT * 3);
    const sPhaseArr = new Float32Array(STAR_COUNT);
    const sSizeArr  = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 40;
      sPosArr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      sPosArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      sPosArr[i * 3 + 2] = r * Math.cos(phi);
      sPhaseArr[i] = Math.random() * Math.PI * 2;
      sSizeArr[i]  = 1.0 + Math.random() * 2.2;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPosArr, 3));
    starGeo.setAttribute('aPhase',   new THREE.BufferAttribute(sPhaseArr, 1));
    starGeo.setAttribute('aSize',    new THREE.BufferAttribute(sSizeArr, 1));
    const starUniforms = { uTime: { value: 0 } };
    const starMat = new THREE.ShaderMaterial({
      uniforms: starUniforms,
      vertexShader: `
        uniform float uTime;
        attribute float aPhase;
        attribute float aSize;
        void main() {
          float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase);
          gl_PointSize = aSize * twinkle;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.1, 0.5, d);
          gl_FragColor = vec4(0.88, 0.93, 1.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // ── Land (async) ─────────────────────────────────────────────────────
    let landMesh: THREE.Mesh | null = null;
    let disposed = false;
    fetch('/data/land.json') // Natural Earth 50m — see scripts/build-land.mjs
      .then((r) => r.json() as Promise<GeoCollection>)
      .then((geojson) => {
        if (disposed) return; // left /earth before the data arrived
        const landGeo = buildLandGeometry(geojson);
        const landMat = new THREE.MeshStandardMaterial({ color: 0x8a9a6a, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
        landMesh = new THREE.Mesh(landGeo, landMat);
        globeGroup.add(landMesh);
      })
      .catch(() => { /* land outlines unavailable — ocean sphere and pins still render */ });

    // ── Pins ─────────────────────────────────────────────────────────────
    const clusters = clusterItems(items);
    const pinMeshes: THREE.Mesh[] = [];
    // Invisible, larger spheres around each pin for raycasting — the visible
    // pins are only a few pixels across, too small to hit reliably by touch.
    const pinHitMeshes: THREE.Mesh[] = [];
    const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

    for (const cluster of clusters) {
      const r = cluster.items.length > 1 ? PIN_RADIUS * 1.5 : PIN_RADIUS;
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      pin.position.copy(latLngToVec3(cluster.lat, cluster.lng, GLOBE_RADIUS + PIN_RADIUS + 0.002));
      pin.userData = { cluster };
      globeGroup.add(pin);
      pinMeshes.push(pin);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(r * 3.5, 8, 8), hitMaterial);
      hit.position.copy(pin.position);
      hit.userData = { cluster, pin };
      globeGroup.add(hit);
      pinHitMeshes.push(hit);
    }

    // ── Interaction state ────────────────────────────────────────────────
    // Open facing the pieces (circular mean of the pins' longitudes) rather
    // than wherever the default orientation happens to point. Auto-rotation
    // waits for the inactivity delay so the pins are seen first.
    const initialSpin = new THREE.Quaternion();
    if (clusters.length > 0) {
      let sx = 0, sy = 0;
      for (const c of clusters) {
        sx += Math.cos((c.lng * Math.PI) / 180);
        sy += Math.sin((c.lng * Math.PI) / 180);
      }
      const meanLng = (Math.atan2(sy, sx) * 180) / Math.PI;
      const facing = latLngToVec3(0, meanLng, 1).setY(0).normalize();
      initialSpin.setFromUnitVectors(facing, new THREE.Vector3(0, 0, 1));
    }

    const ia: InteractState = {
      isDragging: false,
      isAutoRotating: false,
      lastX: 0,
      lastY: 0,
      velX: 0,
      velY: 0,
      inactivityTimer: null,
      pinchDist: 0,
      reducedMotion,
      tiltAngle: EARTH_TILT,
      spinQ: initialSpin,
    };

    // Compose tilt (X) and spin (Y) into globeGroup.quaternion.
    // Called whenever either component changes.
    function applyGlobeRotation() {
      globeGroup.quaternion
        .setFromEuler(new THREE.Euler(ia.tiltAngle, 0, 0))
        .multiply(ia.spinQ);
    }
    applyGlobeRotation();

    // ── Raycaster ────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-9999, -9999);
    let hoveredPin: THREE.Mesh | null = null;
    let elapsed = 0;

    const scheduleResumeAutoRot = () => {
      if (ia.inactivityTimer) clearTimeout(ia.inactivityTimer);
      ia.inactivityTimer = setTimeout(() => {
        // Never spins for people who've asked for reduced motion.
        ia.isAutoRotating = !ia.reducedMotion;
      }, INACTIVITY_DELAY);
    };
    scheduleResumeAutoRot();

    // ── Animation loop ───────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      elapsed += delta;

      // Auto-rotation — spin only, tilt stays fixed. Holds still while a pin
      // is under the pointer, so it can be clicked.
      if (ia.isAutoRotating && !hoveredPin) {
        ia.spinQ.premultiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), AUTO_ROT_SPEED * delta)
        );
        applyGlobeRotation();
      }

      // Momentum — spin and tilt decay independently
      if (!ia.isDragging && !ia.isAutoRotating) {
        let moved = false;
        if (Math.abs(ia.velX) > 0.00005) {
          ia.spinQ.premultiply(
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ia.velX)
          );
          ia.velX *= MOMENTUM_DECAY;
          moved = true;
        }
        if (Math.abs(ia.velY) > 0.00005) {
          ia.tiltAngle = Math.max(TILT_MIN, Math.min(TILT_MAX, ia.tiltAngle + ia.velY));
          ia.velY *= MOMENTUM_DECAY;
          moved = true;
        }
        if (moved) applyGlobeRotation();
      }

      // Star twinkling
      starUniforms.uTime.value = elapsed;

      // Pin pulse
      if (!reducedMotion) {
        const pulse = 1 + 0.4 * Math.sin(elapsed * ((2 * Math.PI) / 2.5));
        for (const pin of pinMeshes) {
          if (pin !== hoveredPin) pin.scale.setScalar(pulse);
        }
      }

      // Raycasting — hover detection
      raycaster.setFromCamera(pointer, camera);
      const pinHits = raycaster.intersectObjects(pinHitMeshes);
      const nextHovered = pinHits.length > 0 ? (pinHits[0].object.userData.pin as THREE.Mesh) : null;

      if (nextHovered !== hoveredPin) {
        // Restore previous
        if (hoveredPin) {
          (hoveredPin.material as THREE.MeshBasicMaterial).color.set(0xffffff);
          hoveredPin.scale.setScalar(1);
        }
        hoveredPin = nextHovered;
        if (hoveredPin) {
          (hoveredPin.material as THREE.MeshBasicMaterial).color.set(0xb8b0a6);
          hoveredPin.scale.setScalar(1.4);
          renderer.domElement.style.cursor = 'pointer';
        } else {
          // Check if over globe
          const sphereHit = raycaster.intersectObject(oceanMesh);
          renderer.domElement.style.cursor = sphereHit.length > 0 ? (ia.isDragging ? 'grabbing' : 'grab') : 'default';
        }
      }

      // Update tooltip position
      if (hoveredPin && tooltipEl) {
        const wp = new THREE.Vector3();
        hoveredPin.getWorldPosition(wp);
        // Visibility check: pin must face camera
        const camDir = wp.clone().normalize();
        const camPos = camera.position.clone().normalize();
        if (camDir.dot(camPos) > 0.1) {
          const proj = wp.clone().project(camera);
          const rect = (wrap as HTMLDivElement).getBoundingClientRect();
          // The canvas slides left when the panel opens; the tooltip's parent
          // doesn't — offset by the difference so the label stays on its pin.
          const parentRect = tooltipEl.parentElement?.getBoundingClientRect() ?? rect;
          const tx = rect.left - parentRect.left + ((proj.x + 1) / 2) * rect.width;
          const ty = rect.top - parentRect.top + ((-proj.y + 1) / 2) * rect.height;
          const cl = (hoveredPin.userData.cluster as Cluster).items[0];
          tooltipEl.textContent = cl.location ?? '';
          tooltipEl.style.left = `${tx}px`;
          tooltipEl.style.top = `${ty - 36}px`;
          tooltipEl.style.display = 'block';
        } else {
          tooltipEl.style.display = 'none';
        }
      } else if (tooltipEl) {
        tooltipEl.style.display = 'none';
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Pointer handlers ─────────────────────────────────────────────────
    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';

    function updatePointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onPointerDown(e: PointerEvent) {
      setShowHint(false);
      ia.isDragging = true;
      ia.isAutoRotating = false;
      ia.velX = 0;
      ia.velY = 0;
      ia.lastX = e.clientX;
      ia.lastY = e.clientY;
      if (ia.inactivityTimer) clearTimeout(ia.inactivityTimer);
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    }

    function onPointerMove(e: PointerEvent) {
      updatePointer(e.clientX, e.clientY);
      if (!ia.isDragging) return;
      const dx = (e.clientX - ia.lastX) * 0.005;
      const dy = (e.clientY - ia.lastY) * 0.005;
      ia.velX = dx;
      ia.velY = dy;
      ia.spinQ.premultiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx)
      );
      ia.tiltAngle = Math.max(TILT_MIN, Math.min(TILT_MAX, ia.tiltAngle + dy));
      applyGlobeRotation();
      ia.lastX = e.clientX;
      ia.lastY = e.clientY;
    }

    function onPointerUp() {
      ia.isDragging = false;
      canvas.style.cursor = hoveredPin ? 'pointer' : 'grab';
      scheduleResumeAutoRot();
    }

    function onPointerLeave() {
      pointer.set(-9999, -9999);
      if (tooltipEl) tooltipEl.style.display = 'none';
    }

    function onClick(e: MouseEvent) {
      if (Math.abs(ia.velX) > 0.004 || Math.abs(ia.velY) > 0.004) return;
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pinHitMeshes);
      if (hits.length > 0) {
        const cluster = hits[0].object.userData.cluster as Cluster;
        setPanel(cluster);
        panelRef.current = cluster;
        ia.isAutoRotating = false;
        if (ia.inactivityTimer) clearTimeout(ia.inactivityTimer);
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      camera.position.z = Math.max(CAM_MIN_Z, Math.min(CAM_MAX_Z, camera.position.z + e.deltaY * 0.002));
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 2) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      ia.pinchDist = Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = ia.pinchDist - dist;
      camera.position.z = Math.max(CAM_MIN_Z, Math.min(CAM_MAX_Z, camera.position.z + delta * 0.005));
      ia.pinchDist = dist;
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    // ── Resize ───────────────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(wrap);

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (ia.inactivityTimer) clearTimeout(ia.inactivityTimer);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (landMesh) {
        landMesh.geometry.dispose();
        (landMesh.material as THREE.Material).dispose();
      }
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      if (wrap.contains(canvas)) wrap.removeChild(canvas);
    };
  }, [items]);

  const panelOpen = panel !== null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Canvas wrapper — shifts left when panel opens */}
      <div
        ref={canvasWrapRef}
        style={{
          position: 'absolute',
          inset: 0,
          transition: 'transform 400ms cubic-bezier(0, 0, 0.2, 1)',
          transform: panelOpen && !isMobile ? `translateX(-${PANEL_SHIFT}px)` : 'translateX(0)',
          touchAction: 'none',
        }}
      />

      {/* Tooltip — DOM-managed, not React state */}
      <div
        ref={tooltipRef}
        style={{
          display: 'none',
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 20,
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.65rem',
          color: '#1c1814',
          background: '#f8f4ef',
          padding: '3px 8px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
        }}
      />

      <p className={`globe-hint${showHint && !panelOpen ? '' : ' globe-hint--hidden'}`} aria-hidden="true">
        <span className="globe-hint-mouse">Drag to explore · click a point to read</span>
        <span className="globe-hint-touch">Drag to explore · tap a point to read</span>
      </p>

      {/* Keyboard / screen-reader access to the pins: hidden until focused. */}
      <nav aria-label="Places on the globe" className="globe-places">
        <ul>
          {places.map((cluster) => {
            const first = cluster.items[0];
            const label = first.location || first.title;
            const n = cluster.items.length;
            return (
              <li key={`${cluster.lat},${cluster.lng}`}>
                <button
                  type="button"
                  onClick={(e) => {
                    placeTriggerRef.current = e.currentTarget;
                    setPanel(cluster);
                    panelRef.current = cluster;
                  }}
                >
                  {label} — {n} {n === 1 ? 'piece' : 'pieces'}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Article panel */}
      <ArticlePanel cluster={panel} onClose={handlePanelClose} isMobile={isMobile} />
    </div>
  );
}
