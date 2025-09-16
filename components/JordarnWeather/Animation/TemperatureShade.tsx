"use client";

import * as React from "react";
import * as THREE from "three";
import { useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";

export default function TemperatureShade({
  enabled = true,
  forecast = false,        // kept for future palette toggles; ramp below ignores this
  opacity = 0.48,
  points = [],
  timelineKey = 0,
  minValue,                // optional clamp (recommend -10)
  maxValue,                // optional clamp (recommend 55)
}: {
  enabled?: boolean;
  forecast?: boolean;
  opacity?: number;
  points?: Array<{ lat: number; lng: number; value: number }>;
  timelineKey?: number;
  minValue?: number;
  maxValue?: number;
}) {
  const map = useMap();

  const glRef = React.useRef<{
    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
    destroy: () => void;
  } | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    // pane + canvas
    const overlayPane = (map as LeafletMap).getPanes().overlayPane;
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "450";
    overlayPane.appendChild(canvas);

    // three setup
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new THREE.PlaneGeometry(2, 2);

    // uniforms
    const MAX_POINTS = 64;
    const uniforms: Record<string, THREE.IUniform> = {
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_opacity: { value: opacity },
      u_ptsCount: { value: 0 },
      u_ptsX: { value: new Array<number>(MAX_POINTS).fill(0) },
      u_ptsY: { value: new Array<number>(MAX_POINTS).fill(0) },
      u_ptsVal: { value: new Array<number>(MAX_POINTS).fill(0) },
      // fixed legend range (defaults)
      u_absMin: { value: typeof minValue === "number" ? minValue : -10 },
      u_absMax: { value: typeof maxValue === "number" ? maxValue : 55 },
    };

    const vert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment: IDW field + absolute NCM-like color ramp (-10..55 °C).
    const frag = `
      precision mediump float;

      varying vec2 vUv;
      uniform vec2  u_resolution;
      uniform float u_opacity;

      uniform int   u_ptsCount;
      uniform float u_ptsX[64];
      uniform float u_ptsY[64];
      uniform float u_ptsVal[64];

      uniform float u_absMin;
      uniform float u_absMax;

      // tiny static noise to avoid banding
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
      }

      // --- Absolute ramp based on your legend ticks ---
      // Stops at: -10, 0, 4, 8, 12, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 55 (°C)
      // Colors approximate the screenshot (cool blues -> greens -> yellows -> oranges -> reds).
      vec3 c_neg10 = vec3(0.84, 0.94, 1.00); // #d6f0ff
      vec3 c_0     = vec3(0.61, 0.84, 1.00); // #9bd5ff
      vec3 c_4     = vec3(0.37, 0.69, 1.00); // #5fb0ff
      vec3 c_8     = vec3(0.16, 0.48, 1.00); // #2a7bff
      vec3 c_12    = vec3(0.04, 0.26, 0.75); // #0b43bf (deep blue)
      vec3 c_16    = vec3(0.10, 0.73, 0.50); // #19bb80-ish (green)
      vec3 c_18    = vec3(0.13, 0.77, 0.37); // #22c55e
      vec3 c_20    = vec3(0.29, 0.86, 0.50); // #4ade80
      vec3 c_24    = vec3(0.64, 0.90, 0.21); // #a3e635
      vec3 c_28    = vec3(0.99, 0.88, 0.28); // #fde047
      vec3 c_32    = vec3(0.98, 0.80, 0.08); // #facc15
      vec3 c_36    = vec3(0.96, 0.62, 0.04); // #f59e0b
      vec3 c_40    = vec3(0.98, 0.45, 0.09); // #f97316
      vec3 c_44    = vec3(0.94, 0.27, 0.27); // #ef4444
      vec3 c_48    = vec3(0.86, 0.15, 0.15); // #dc2626
      vec3 c_55    = vec3(0.73, 0.11, 0.11); // #b91c1c

      vec3 blend(vec3 a, vec3 b, float x) { return mix(a, b, clamp(x, 0.0, 1.0)); }

      vec3 colorForDeg(float d) {
        if (d <= -10.0) return c_neg10;
        if (d <   0.0)  return blend(c_neg10, c_0,  (d + 10.0) / 10.0);
        if (d <   4.0)  return blend(c_0,     c_4,  (d - 0.0)  / 4.0);
        if (d <   8.0)  return blend(c_4,     c_8,  (d - 4.0)  / 4.0);
        if (d <  12.0)  return blend(c_8,     c_12, (d - 8.0)  / 4.0);
        if (d <  16.0)  return blend(c_12,    c_16, (d - 12.0) / 4.0);
        if (d <  18.0)  return blend(c_16,    c_18, (d - 16.0) / 2.0);
        if (d <  20.0)  return blend(c_18,    c_20, (d - 18.0) / 2.0);
        if (d <  24.0)  return blend(c_20,    c_24, (d - 20.0) / 4.0);
        if (d <  28.0)  return blend(c_24,    c_28, (d - 24.0) / 4.0);
        if (d <  32.0)  return blend(c_28,    c_32, (d - 28.0) / 4.0);
        if (d <  36.0)  return blend(c_32,    c_36, (d - 32.0) / 4.0);
        if (d <  40.0)  return blend(c_36,    c_40, (d - 36.0) / 4.0);
        if (d <  44.0)  return blend(c_40,    c_44, (d - 40.0) / 4.0);
        if (d <  48.0)  return blend(c_44,    c_48, (d - 44.0) / 4.0);
        if (d <  55.0)  return blend(c_48,    c_55, (d - 48.0) / 7.0);
        return c_55;
      }

      void main() {
        vec2 px = vUv * u_resolution;

        // IDW from station samples
        float accum = 0.0;
        float wsum = 0.0;
        for (int i = 0; i < 64; i++) {
          if (i >= u_ptsCount) break;
          vec2 sp = vec2(u_ptsX[i], u_ptsY[i]);
          float d = distance(px, sp);
          float w = 1.0 / max(d, 1.0);   // power=1; tweak if you want sharper fields
          accum += w * u_ptsVal[i];
          wsum += w;
        }
        float deg = (wsum > 0.0) ? (accum / wsum) : 0.0;

        // clamp to legend domain (so colors are consistent)
        deg = clamp(deg, u_absMin, u_absMax);

        // subtle static texture to avoid banding
        float n = noise(px / 64.0);
        deg += (n - 0.5) * 0.3; // tiny ±0.15°C dither
        deg = clamp(deg, u_absMin, u_absMax);

        vec3 col = colorForDeg(deg);
        gl_FragColor = vec4(col, u_opacity);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    glRef.current = {
      canvas,
      renderer,
      scene,
      camera,
      mesh,
      material,
      destroy: () => {
        scene.remove(mesh);
        material.dispose();
        geo.dispose();
        renderer.dispose();
        canvas.remove();
      },
    };

    // helpers
    const setSize = () => {
      const size = map.getSize();
      renderer.setSize(size.x, size.y, false);
      (uniforms.u_resolution.value as THREE.Vector2).set(size.x * dpr, size.y * dpr);
    };

    const projectPoints = () => {
      const max = points.length;
      const count = Math.min(MAX_POINTS, max);
      (uniforms.u_ptsCount.value as number) = count;
      const xs = uniforms.u_ptsX.value as number[];
      const ys = uniforms.u_ptsY.value as number[];
      const vs = uniforms.u_ptsVal.value as number[];
      for (let i = 0; i < count; i++) {
        const p = points[i];
        const pt = map.latLngToContainerPoint([p.lat, p.lng]);
        xs[i] = pt.x;
        ys[i] = pt.y;
        vs[i] = p.value;
      }
      for (let i = count; i < MAX_POINTS; i++) { xs[i] = 0; ys[i] = 0; vs[i] = 0; }
      if (typeof minValue === "number") (uniforms.u_absMin.value as number) = minValue;
      if (typeof maxValue === "number") (uniforms.u_absMax.value as number) = maxValue;
    };

    const draw = () => {
      renderer.render(scene, camera);
    };

    // first paint
    setSize();
    projectPoints();
    draw();

    // updates (still static)
    const onResize = () => { setSize(); projectPoints(); draw(); };
    const onMove = () =>   { projectPoints(); draw(); };
    map.on("resize", onResize);
    map.on("move", onMove);
    map.on("zoomend", onMove);

    return () => {
      map.off("resize", onResize);
      map.off("move", onMove);
      map.off("zoomend", onMove);
      glRef.current?.destroy();
      glRef.current = null;
    };
  }, [map, enabled, opacity, points, timelineKey, minValue, maxValue]);

  // runtime prop updates
  React.useEffect(() => {
    if (!glRef.current) return;
    glRef.current.material.uniforms.u_opacity.value = opacity;
    glRef.current.renderer.render(glRef.current.scene, glRef.current.camera);
  }, [opacity]);

  return null;
}
