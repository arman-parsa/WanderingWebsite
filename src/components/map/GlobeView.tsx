'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { formatDate } from '@/lib/utils';
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

type TooltipData = { text: string; x: number; y: number };

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
// edge spans ≤ MAX_SPAN degrees, then project each leaf triangle onto the sphere.
// Without subdivision, large-country triangles form flat chords that dip below
// the ocean sphere surface — the ocean occludes them from the camera as holes.
const MAX_TRI_SPAN = 10;

function subdivideAndEmit(
  lng0: number, lat0: number,
  lng1: number, lat1: number,
  lng2: number, lat2: number,
  out: number[]
): void {
  const dLng = Math.max(Math.abs(lng1 - lng0), Math.abs(lng2 - lng0), Math.abs(lng2 - lng1));
  const dLat = Math.max(Math.abs(lat1 - lat0), Math.abs(lat2 - lat0), Math.abs(lat2 - lat1));

  if (dLng <= MAX_TRI_SPAN && dLat <= MAX_TRI_SPAN) {
    const v0 = latLngToVec3(lat0, lng0, LAND_RADIUS);
    const v1 = latLngToVec3(lat1, lng1, LAND_RADIUS);
    const v2 = latLngToVec3(lat2, lng2, LAND_RADIUS);
    out.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
    return;
  }
  // Split into 4 sub-triangles at edge midpoints
  const m01lng = (lng0 + lng1) / 2, m01lat = (lat0 + lat1) / 2;
  const m12lng = (lng1 + lng2) / 2, m12lat = (lat1 + lat2) / 2;
  const m20lng = (lng2 + lng0) / 2, m20lat = (lat2 + lat0) / 2;
  subdivideAndEmit(lng0, lat0,   m01lng, m01lat, m20lng, m20lat, out);
  subdivideAndEmit(m01lng, m01lat, lng1, lat1,   m12lng, m12lat, out);
  subdivideAndEmit(m20lng, m20lat, m12lng, m12lat, lng2, lat2,  out);
  subdivideAndEmit(m01lng, m01lat, m12lng, m12lat, m20lng, m20lat, out);
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

    const shape = new THREE.Shape();
    shape.moveTo(ring[0][0], ring[0][1]);
    for (let i = 1; i < n; i++) shape.lineTo(ring[i][0], ring[i][1]);

    const shapeGeo = new THREE.ShapeGeometry(shape);
    const flat = shapeGeo.toNonIndexed();
    const pos = flat.attributes.position;

    for (let i = 0; i < pos.count; i += 3) {
      subdivideAndEmit(
        pos.getX(i),     pos.getY(i),
        pos.getX(i + 1), pos.getY(i + 1),
        pos.getX(i + 2), pos.getY(i + 2),
        verts
      );
    }

    shapeGeo.dispose();
    flat.dispose();
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
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
  geo.computeVertexNormals();
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
};

// ── Component ────────────────────────────────────────────────────────────────

export default function GlobeView({ items }: { items: GlobeItem[] }) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Cluster | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const panelRef = useRef<Cluster | null>(null);

  const handlePanelClose = useCallback(() => {
    setPanel(null);
    panelRef.current = null;
  }, []);

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
      new THREE.MeshStandardMaterial({ color: 0x7a9aaa, roughness: 0.95, metalness: 0 })
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

    // ── Land (async) ─────────────────────────────────────────────────────
    let landMesh: THREE.Mesh | null = null;
    fetch('/data/ne_110m_land.json')
      .then((r) => r.json() as Promise<GeoCollection>)
      .then((geojson) => {
        const landGeo = buildLandGeometry(geojson);
        const landMat = new THREE.MeshStandardMaterial({ color: 0x8a9a6a, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
        landMesh = new THREE.Mesh(landGeo, landMat);
        globeGroup.add(landMesh);
      });

    // ── Pins ─────────────────────────────────────────────────────────────
    const clusters = clusterItems(items);
    const pinMeshes: THREE.Mesh[] = [];

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
    }

    // ── Interaction state ────────────────────────────────────────────────
    const ia: InteractState = {
      isDragging: false,
      isAutoRotating: !reducedMotion,
      lastX: 0,
      lastY: 0,
      velX: 0,
      velY: 0,
      inactivityTimer: null,
      pinchDist: 0,
      reducedMotion,
    };

    // ── Raycaster ────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-9999, -9999);
    let hoveredPin: THREE.Mesh | null = null;
    let elapsed = 0;

    const TILT_LIMIT = Math.PI / 6; // ±30°
    function clampTilt() {
      const euler = new THREE.Euler().setFromQuaternion(globeGroup.quaternion, 'YXZ');
      euler.x = Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, euler.x));
      globeGroup.quaternion.setFromEuler(euler);
    }

    const scheduleResumeAutoRot = () => {
      if (ia.inactivityTimer) clearTimeout(ia.inactivityTimer);
      ia.inactivityTimer = setTimeout(() => {
        ia.isAutoRotating = true;
      }, INACTIVITY_DELAY);
    };

    // ── Animation loop ───────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      elapsed += delta;

      // Auto-rotation
      if (ia.isAutoRotating) {
        const q = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          AUTO_ROT_SPEED * delta
        );
        globeGroup.quaternion.premultiply(q);
      }

      // Momentum
      if (!ia.isDragging && !ia.isAutoRotating && (Math.abs(ia.velX) > 0.00005 || Math.abs(ia.velY) > 0.00005)) {
        const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ia.velX);
        const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), ia.velY);
        globeGroup.quaternion.premultiply(qY);
        globeGroup.quaternion.premultiply(qX);
        clampTilt();
        ia.velX *= MOMENTUM_DECAY;
        ia.velY *= MOMENTUM_DECAY;
      }

      // Pin pulse
      if (!reducedMotion) {
        const pulse = 1 + 0.4 * Math.sin(elapsed * ((2 * Math.PI) / 2.5));
        for (const pin of pinMeshes) {
          if (pin !== hoveredPin) pin.scale.setScalar(pulse);
        }
      }

      // Raycasting — hover detection
      raycaster.setFromCamera(pointer, camera);
      const pinHits = raycaster.intersectObjects(pinMeshes);
      const nextHovered = pinHits.length > 0 ? (pinHits[0].object as THREE.Mesh) : null;

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
          const tx = ((proj.x + 1) / 2) * rect.width;
          const ty = ((-proj.y + 1) / 2) * rect.height;
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

    function updatePointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onPointerDown(e: PointerEvent) {
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
      const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx);
      const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy);
      globeGroup.quaternion.premultiply(qY);
      globeGroup.quaternion.premultiply(qX);
      clampTilt();
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
      const hits = raycaster.intersectObjects(pinMeshes);
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
      renderer.dispose();
      if (wrap.contains(canvas)) wrap.removeChild(canvas);
    };
  }, [items]);

  const TYPE_HREF: Record<string, string> = {
    writing: '/writing',
    mixedMedia: '/mixed-media',
    photography: '/photography',
    videography: '/videography',
  };

  void TYPE_HREF; // used in ArticlePanel, suppress warning
  void formatDate; // used in ArticlePanel

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

      {/* Article panel */}
      <ArticlePanel cluster={panel} onClose={handlePanelClose} isMobile={isMobile} />
    </div>
  );
}
