"use client";

import * as React from "react";
import * as THREE from "three";
import { useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";

/**
 * Static temperature-like color shade (no numbers, no animation).
 * Re-renders on map resize/move/zoom. Uses a latitude-weighted gradient
 * plus tiny static noise so it looks “field-like”.
 */
type Point = { x: number; y: number; value: number };

export default function TemperatureShade({
  enabled = true,
  forecast = false,
  opacity = 0.48,
  points = [], // geographic station points will be reprojected on-the-fly
  timelineKey = 0,
  minValue,
  maxValue,
}: {
  enabled?: boolean;
  forecast?: boolean;
  opacity?: number;
  points?: Array<{ lat: number; lng: number; value: number }>;
  timelineKey?: number; // to trigger redraws along the timeline
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

    // ---- pane + canvas
    const overlayPane = (map as LeafletMap).getPanes().overlayPane;
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "450";          // under markers/popup
    overlayPane.appendChild(canvas);

    // ---- three basics
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new THREE.PlaneGeometry(2, 2);

    // uniforms (no time for now — static)
    const MAX_POINTS = 64; // cap for uniforms
    const uniforms: Record<string, THREE.IUniform> = {
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_opacity: { value: opacity },
      u_mode: { value: forecast ? 1 : 0 },
      u_ptsCount: { value: 0 },
      u_ptsX: { value: new Array<number>(MAX_POINTS).fill(0) },
      u_ptsY: { value: new Array<number>(MAX_POINTS).fill(0) },
      u_ptsVal: { value: new Array<number>(MAX_POINTS).fill(0) },
      u_minVal: { value: typeof minValue === 'number' ? minValue : 0 },
      u_maxVal: { value: typeof maxValue === 'number' ? maxValue : 1 },
    };

    const vert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // IDW shader over station samples; realistic temp color ramp
    const frag = `
      precision mediump float;

      varying vec2 vUv;
      uniform vec2  u_resolution;
      uniform float u_opacity;
      uniform int   u_mode;
      uniform int   u_ptsCount;
      uniform float u_ptsX[64];
      uniform float u_ptsY[64];
      uniform float u_ptsVal[64];
      uniform float u_minVal;
      uniform float u_maxVal;

      // tiny static value noise (screen-space) to avoid banding
      float hash(vec2 p) {
        // cheap hash
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

      // perceptual-ish temperature palette (cold blue -> cool cyan -> mild green -> warm yellow -> hot red)
      vec3 tempPalette(float t) {
        t = clamp(t, 0.0, 1.0);
        vec3 c0 = vec3(0.05, 0.20, 0.70); // cold blue
        vec3 c1 = vec3(0.10, 0.65, 0.85); // cyan
        vec3 c2 = vec3(0.20, 0.75, 0.40); // green
        vec3 c3 = vec3(0.98, 0.92, 0.30); // yellow
        vec3 c4 = vec3(0.90, 0.20, 0.10); // red
        if (t < 0.25) return mix(c0, c1, t/0.25);
        else if (t < 0.5) return mix(c1, c2, (t-0.25)/0.25);
        else if (t < 0.75) return mix(c2, c3, (t-0.5)/0.25);
        return mix(c3, c4, (t-0.75)/0.25);
      }

      void main() {
        // pixel space coordinate
        vec2 px = vUv * u_resolution;
        
        // Inverse-distance weighting (IDW)
        float accum = 0.0;
        float wsum = 0.0;
        for (int i = 0; i < 64; i++) {
          if (i >= u_ptsCount) break;
          vec2 sp = vec2(u_ptsX[i], u_ptsY[i]);
          float d = distance(px, sp);
          // avoid singularity at zero distance
          float w = 1.0 / max(d, 1.0);
          accum += w * u_ptsVal[i];
          wsum += w;
        }
        float v = (wsum > 0.0) ? (accum / wsum) : 0.0;
        // normalize by provided min/max
        float t = (v - u_minVal) / max(1e-6, (u_maxVal - u_minVal));
        // gentle noise to remove banding
        float n = noise(px/64.0);
        t = clamp(t + (n - 0.5) * 0.03, 0.0, 1.0);
        
        vec3 col = tempPalette(t);
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

    // --- helpers
    const setSize = () => {
      const size = map.getSize();
      renderer.setSize(size.x, size.y, false);
      (uniforms.u_resolution.value as THREE.Vector2).set(size.x * dpr, size.y * dpr);
    };

    const projectPoints = () => {
      // project geographic to container pixel coords
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
      // clamp remaining if fewer than MAX
      for (let i = count; i < MAX_POINTS; i++) { xs[i] = 0; ys[i] = 0; vs[i] = 0; }
      // update min/max if provided
      if (typeof minValue === 'number') (uniforms.u_minVal.value as number) = minValue;
      if (typeof maxValue === 'number') (uniforms.u_maxVal.value as number) = maxValue;
    };

    const draw = () => {
      renderer.render(scene, camera);
    };

    // first paint
    setSize();
    projectPoints();
    draw();

    // keep it updated (no animation loop — static)
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
  }, [map, enabled, forecast, opacity, points, timelineKey, minValue, maxValue]);

  // reflect prop changes into uniforms without recreating everything
  React.useEffect(() => {
    if (!glRef.current) return;
    glRef.current.material.uniforms.u_opacity.value = opacity;
    glRef.current.material.uniforms.u_mode.value = forecast ? 1 : 0;
    glRef.current.renderer.render(glRef.current.scene, glRef.current.camera);
  }, [opacity, forecast]);

  return null;
}
