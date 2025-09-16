// "use client";

// import * as React from "react";
// import * as THREE from "three";
// import { useMap } from "react-leaflet";
// import type { Map as LeafletMap } from "leaflet";
// import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

// type StationPt = { lat: number; lng: number; value: number };

// export default function TemperatureShade({
//   enabled = true,
//   opacity = 0.55,
//   points = [],
//   timelineKey = 0,
//   minValue = -10,           // legend low
//   maxValue = 50,            // legend high
//   maskGeoJson,              // ⬅️  GeoJSON boundary (e.g., jordan.json)
// }: {
//   enabled?: boolean;
//   opacity?: number;
//   points?: StationPt[];
//   timelineKey?: number;
//   minValue?: number;
//   maxValue?: number;
//   maskGeoJson?: FeatureCollection;  // pass Jordan outline here
// }) {
//   const map = useMap();

//   const glRef = React.useRef<{
//     canvas: HTMLCanvasElement;
//     renderer: THREE.WebGLRenderer;
//     scene: THREE.Scene;
//     camera: THREE.OrthographicCamera;
//     mesh: THREE.Mesh;
//     material: THREE.ShaderMaterial;
//     maskCanvas: HTMLCanvasElement | null;
//     maskTex: THREE.Texture | null;
//     destroy: () => void;
//   } | null>(null);

//   React.useEffect(() => {
//     if (!enabled) return;

//     // ---- create canvas in Leaflet overlay pane
//     const overlayPane = (map as LeafletMap).getPanes().overlayPane;
//     const canvas = document.createElement("canvas");
//     canvas.style.position = "absolute";
//     canvas.style.left = "0";
//     canvas.style.top = "0";
//     canvas.style.pointerEvents = "none";
//     canvas.style.zIndex = "450";
//     overlayPane.appendChild(canvas);

//     // Three.js boilerplate
//     const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true });
//     const dpr = Math.min(2, window.devicePixelRatio || 1);
//     renderer.setPixelRatio(dpr);

//     const scene  = new THREE.Scene();
//     const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
//     const geo    = new THREE.PlaneGeometry(2, 2);

//     // --- MASK canvas & texture (for GeoJSON clip)
//     const maskCanvas = document.createElement("canvas");
//     const maskTex = new THREE.CanvasTexture(maskCanvas);
//     maskTex.flipY = false;
//     maskTex.minFilter = THREE.LinearFilter;
//     maskTex.magFilter = THREE.LinearFilter;

//     const MAX_POINTS = 64;
//     const uniforms: Record<string, THREE.IUniform> = {
//       u_resolution: { value: new THREE.Vector2(1, 1) },
//       u_opacity:    { value: opacity },
//       u_ptsCount:   { value: 0 },
//       u_ptsX:       { value: new Array<number>(MAX_POINTS).fill(0) },
//       u_ptsY:       { value: new Array<number>(MAX_POINTS).fill(0) },
//       u_ptsVal:     { value: new Array<number>(MAX_POINTS).fill(0) },
//       u_min:        { value: minValue },
//       u_max:        { value: maxValue },
//       u_mask:       { value: maskTex },
//     };

//     const vert = `
//       varying vec2 vUv;
//       void main() {
//         vUv = uv;
//         gl_Position = vec4(position, 1.0);
//       }
//     `;

//     // ---- Fragment: IDW + DISCRETE color classes + GeoJSON mask
//     const frag = `
//       precision mediump float;

//       varying vec2 vUv;
//       uniform vec2  u_resolution;
//       uniform float u_opacity;

//       uniform int   u_ptsCount;
//       uniform float u_ptsX[64];
//       uniform float u_ptsY[64];
//       uniform float u_ptsVal[64];

//       uniform float u_min;
//       uniform float u_max;

//       uniform sampler2D u_mask;   // 0 outside country, 1 inside

//       float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
//       float noise(vec2 p){
//         vec2 i=floor(p), f=fract(p);
//         vec2 u=f*f*(3.0-2.0*f);
//         float a=hash(i);
//         float b=hash(i+vec2(1,0));
//         float c=hash(i+vec2(0,1));
//         float d=hash(i+vec2(1,1));
//         return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
//       }

//       // ---- fixed swatches from your JSON ----
//       // -10..-5  : #ADD8E6
//       // -5..0    : #6495ED
//       // 0..5     : #0000FF
//       // 5..10    : #00BFFF
//       // 10..14   : #006400
//       // 14..18   : #008000
//       // 18..20   : #90EE90
//       // 20..24   : #ADFF2F
//       // 24..28   : #FFFF00
//       // 28..30   : #FFD700
//       // 30..34   : #FFA500
//       // 34..38   : #FF8C00
//       // 38..44   : #FF4500
//       // 44..48   : #FF0000
//       // 48..50   : #8B0000

//       vec3 C_ADD8E6 = vec3(0xAD,0xD8,0xE6) / 255.0;
//       vec3 C_6495ED = vec3(0x64,0x95,0xED) / 255.0;
//       vec3 C_0000FF = vec3(0x00,0x00,0xFF) / 255.0;
//       vec3 C_00BFFF = vec3(0x00,0xBF,0xFF) / 255.0;
//       vec3 C_006400 = vec3(0x00,0x64,0x00) / 255.0;
//       vec3 C_008000 = vec3(0x00,0x80,0x00) / 255.0;
//       vec3 C_90EE90 = vec3(0x90,0xEE,0x90) / 255.0;
//       vec3 C_ADFF2F = vec3(0xAD,0xFF,0x2F) / 255.0;
//       vec3 C_FFFF00 = vec3(0xFF,0xFF,0x00) / 255.0;
//       vec3 C_FFD700 = vec3(0xFF,0xD7,0x00) / 255.0;
//       vec3 C_FFA500 = vec3(0xFF,0xA5,0x00) / 255.0;
//       vec3 C_FF8C00 = vec3(0xFF,0x8C,0x00) / 255.0;
//       vec3 C_FF4500 = vec3(0xFF,0x45,0x00) / 255.0;
//       vec3 C_FF0000 = vec3(0xFF,0x00,0x00) / 255.0;
//       vec3 C_8B0000 = vec3(0x8B,0x00,0x00) / 255.0;

//       vec3 colorFor(float t) {
//         // clamp to legend domain
//         t = clamp(t, u_min, u_max);

//         if (t < -5.0)  return C_ADD8E6;
//         if (t <  0.0)  return C_6495ED;
//         if (t <  5.0)  return C_0000FF;
//         if (t < 10.0)  return C_00BFFF;
//         if (t < 14.0)  return C_006400;
//         if (t < 18.0)  return C_008000;
//         if (t < 20.0)  return C_90EE90;
//         if (t < 24.0)  return C_ADFF2F;
//         if (t < 28.0)  return C_FFFF00;
//         if (t < 30.0)  return C_FFD700;
//         if (t < 34.0)  return C_FFA500;
//         if (t < 38.0)  return C_FF8C00;
//         if (t < 44.0)  return C_FF4500;
//         if (t < 48.0)  return C_FF0000;
//         if (t <= 50.0) return C_8B0000;
//         return C_8B0000;
//       }

//       void main() {
//         vec2 px = vUv * u_resolution;

//         // --- IDW from station samples ---
//         float accum = 0.0;
//         float wsum  = 0.0;
//         for (int i=0; i<64; i++) {
//           if (i >= u_ptsCount) break;
//           vec2 sp = vec2(u_ptsX[i], u_ptsY[i]);
//           float d = distance(px, sp);
//           float w = 1.0 / max(d, 1.0); // power=1
//           accum += w * u_ptsVal[i];
//           wsum  += w;
//         }
//         float deg = (wsum > 0.0) ? (accum/wsum) : 0.0;

//         // little static dither to avoid banding
//         float n = noise(px/64.0);
//         deg += (n - 0.5) * 0.20;  // ±0.1 °C

//         vec3 col = colorFor(deg);

//         // --- Geo mask ---
//         float m = 1.0;
//         #ifdef GL_FRAG_COLOR
//         #endif
//         // mask texture sampled in UV space (0..1)
//         m = texture2D(u_mask, vUv).r; // white=1 inside, black=0 outside

//         gl_FragColor = vec4(col, u_opacity * m);
//       }
//     `;

//     const material = new THREE.ShaderMaterial({
//       uniforms,
//       vertexShader: vert,
//       fragmentShader: frag,
//       transparent: true,
//       depthTest: false,
//       depthWrite: false,
//     });

//     const mesh = new THREE.Mesh(geo, material);
//     scene.add(mesh);

//     // ---- helpers
//     const setSize = () => {
//       const size = map.getSize();
//       renderer.setSize(size.x, size.y, false);
//       (uniforms.u_resolution.value as THREE.Vector2).set(size.x * dpr, size.y * dpr);

//       // resize mask canvas to the same CSS size (scale by DPR in 2D ctx)
//       maskCanvas.width  = Math.max(1, Math.floor(size.x * dpr));
//       maskCanvas.height = Math.max(1, Math.floor(size.y * dpr));
//     };

//     // draw GeoJSON to maskCanvas (white inside, black outside)
//     const drawMask = () => {
//       const ctx = maskCanvas.getContext("2d")!;
//       const size = map.getSize();

//       // clear to black
//       ctx.save();
//       ctx.setTransform(1,0,0,1,0,0);
//       ctx.clearRect(0,0,maskCanvas.width, maskCanvas.height);
//       ctx.restore();

//       // scale for DPR
//       ctx.save();
//       ctx.scale(dpr, dpr);

//       // fill white polygons
//       ctx.fillStyle = "#ffffff";
//       ctx.beginPath();

//       if (maskGeoJson) {
//         for (const f of maskGeoJson.features) {
//           const g = f.geometry;
//           if (!g) continue;

//           const drawRing = (ring: number[][]) => {
//             if (!ring.length) return;
//             const [lng0, lat0] = ring[0];
//             const p0 = map.latLngToContainerPoint([lat0, lng0]);
//             ctx.moveTo(p0.x, p0.y);
//             for (let i = 1; i < ring.length; i++) {
//               const [lng, lat] = ring[i];
//               const p = map.latLngToContainerPoint([lat, lng]);
//               ctx.lineTo(p.x, p.y);
//             }
//             ctx.closePath();
//           };

//           if (g.type === "Polygon") {
//             const poly = g as Polygon;
//             for (const ring of poly.coordinates) drawRing(ring as any);
//           } else if (g.type === "MultiPolygon") {
//             const mpoly = g as MultiPolygon;
//             for (const poly of mpoly.coordinates) {
//               for (const ring of poly) drawRing(ring as any);
//             }
//           }
//         }
//       } else {
//         // no mask provided -> full white
//         ctx.rect(0, 0, size.x, size.y);
//       }

//       // evenodd to support holes if any
//       ctx.fill("evenodd");
//       ctx.restore();

//       // upload to GPU
//       maskTex.needsUpdate = true;
//     };

//     const projectPoints = () => {
//       const count = Math.min(MAX_POINTS, points.length);
//       uniforms.u_ptsCount.value = count;
//       const xs = uniforms.u_ptsX.value as number[];
//       const ys = uniforms.u_ptsY.value as number[];
//       const vs = uniforms.u_ptsVal.value as number[];
//       for (let i = 0; i < count; i++) {
//         const p = points[i];
//         const pt = map.latLngToContainerPoint([p.lat, p.lng]);
//         xs[i] = pt.x;
//         ys[i] = pt.y;
//         vs[i] = p.value;
//       }
//       for (let i = count; i < MAX_POINTS; i++) { xs[i] = 0; ys[i] = 0; vs[i] = 0; }
//       uniforms.u_min.value = minValue;
//       uniforms.u_max.value = maxValue;
//     };

//     const draw = () => renderer.render(scene, camera);

//     // initial paint
//     setSize();
//     projectPoints();
//     drawMask();
//     draw();

//     const onResize = () => { setSize(); projectPoints(); drawMask(); draw(); };
//     const onMove   = () => { projectPoints(); drawMask(); draw(); };

//     map.on("resize", onResize);
//     map.on("move", onMove);
//     map.on("zoomend", onMove);

//     glRef.current = {
//       canvas, renderer, scene, camera, mesh, material, maskCanvas, maskTex,
//       destroy: () => {
//         scene.remove(mesh);
//         material.dispose();
//         geo.dispose();
//         renderer.dispose();
//         canvas.remove();
//       },
//     };

//     return () => {
//       map.off("resize", onResize);
//       map.off("move", onMove);
//       map.off("zoomend", onMove);
//       glRef.current?.destroy();
//       glRef.current = null;
//     };
//   }, [map, enabled, timelineKey, minValue, maxValue, maskGeoJson, points]);

//   // live opacity tweak
//   React.useEffect(() => {
//     if (!glRef.current) return;
//     glRef.current.material.uniforms.u_opacity.value = opacity;
//     glRef.current.renderer.render(glRef.current.scene, glRef.current.camera);
//   }, [opacity]);

//   return null;
// }


"use client";

import * as React from "react";
import * as THREE from "three";
import { useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import type { FeatureCollection } from "geojson";

type Sample = { lat: number; lng: number; value: number };

export default function TemperatureShade({
  enabled = true,
  opacity = 0.55,
  points = [],
  timelineKey = 0,         // টাইমলাইন পাল্টালে রেড্র—স্ট্যাটিকই থাকবে
  minValue = -10,          // আপনার লিজেন্ড অনুযায়ী
  maxValue = 50,           // আপনার লিজেন্ড অনুযায়ী
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maskGeoJson,
}: {
  enabled?: boolean;
  opacity?: number;
  points?: Sample[];
  timelineKey?: number;
  minValue?: number;
  maxValue?: number;
  maskGeoJson?: FeatureCollection;
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

    // ---- canvas overlay (Leaflet overlayPane)
    const pane = (map as LeafletMap).getPanes().overlayPane;
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "450";
    pane.appendChild(canvas);

    // ---- three basics
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);

    const MAX_POINTS = 64;
    const uniforms: Record<string, THREE.IUniform> = {
      u_resolution: { value: new THREE.Vector2(1, 1) },     // CSS px (DPR ছাড়া)
      u_opacity: { value: opacity },

      u_ptsCount: { value: 0 },
      u_ptsX: { value: new Array<number>(MAX_POINTS).fill(0) },
      u_ptsY: { value: new Array<number>(MAX_POINTS).fill(0) },
      u_ptsVal: { value: new Array<number>(MAX_POINTS).fill(0) },

      u_absMin: { value: minValue },
      u_absMax: { value: maxValue },
    };

    const vert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment shader:
    //  - vUv কে উল্টে নিচ্ছি: uv = vec2(vUv.x, 1.0 - vUv.y)
    //  - IDW (inverse-distance weighting) থেকে টেম্পারেচার
    //  - আপনার দেওয়া ডিসক্রিট কালার রেঞ্জে শেড
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

      // --- ছোট স্ট্যাটিক নয়েজ, ব্যান্ডিং কমাতে
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

      // --- ডিসক্রিট কালার স্কেল (আপনার JSON অনুযায়ী)
     vec3 C(float r, float g, float b){ return vec3(r, g, b) / 255.0; }

      vec3 bandColor(float deg){
  if (deg < -5.0) return C(173.0, 216.0, 230.0); // -10..-5  #ADD8E6
  if (deg <  0.0) return C(100.0, 149.0, 237.0); //  -5..0   #6495ED
  if (deg <  5.0) return C(  0.0,   0.0, 255.0); //   0..5   #0000FF
  if (deg < 10.0) return C(  0.0, 191.0, 255.0); //  5..10   #00BFFF
  if (deg < 14.0) return C(  0.0, 100.0,   0.0); // 10..14   #006400
  if (deg < 18.0) return C(  0.0, 128.0,   0.0); // 14..18   #008000
  if (deg < 20.0) return C(144.0, 238.0, 144.0); // 18..20   #90EE90
  if (deg < 24.0) return C(173.0, 255.0,  47.0); // 20..24   #ADFF2F
  if (deg < 28.0) return C(255.0, 255.0,   0.0); // 24..28   #FFFF00
  if (deg < 30.0) return C(255.0, 215.0,   0.0); // 28..30   #FFD700
  if (deg < 34.0) return C(255.0, 165.0,   0.0); // 30..34   #FFA500
  if (deg < 38.0) return C(255.0, 140.0,   0.0); // 34..38   #FF8C00
  if (deg < 44.0) return C(255.0,  69.0,   0.0); // 38..44   #FF4500
  if (deg < 48.0) return C(255.0,   0.0,   0.0); // 44..48   #FF0000
  return               C(139.0,   0.0,   0.0);   // 48..50+  #8B0000
}

      void main(){
        // --------- Y-ফ্লিপ: ওপর-নিচ অদল-বদল ----------
        vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
        vec2 px = uv * u_resolution;  // CSS pixels (DPR ছাড়া)

        // --------- Inverse-Distance Weighting ----------
        float acc = 0.0;
        float wsum = 0.0;
        for (int i = 0; i < 64; i++) {
          if (i >= u_ptsCount) break;
          vec2 sp = vec2(u_ptsX[i], u_ptsY[i]);
          float d = distance(px, sp);
          float w = 1.0 / max(d, 1.0);  // power=1
          acc  += w * u_ptsVal[i];
          wsum += w;
        }
        float deg = (wsum > 0.0) ? (acc / wsum) : 0.0;

        // clamp to legend domain
        deg = clamp(deg, u_absMin, u_absMax);

        // নরম ডিথার
        deg += (noise(px/64.0) - 0.5) * 0.2;
        deg = clamp(deg, u_absMin, u_absMax);

        vec3 col = bandColor(deg);
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

    const mesh = new THREE.Mesh(quad, material);
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
        quad.dispose();
        renderer.dispose();
        canvas.remove();
      },
    };

    // ---- helpers
    const setSize = () => {
      const size = map.getSize();
      renderer.setSize(size.x, size.y, false);
      // NOTE: শেডারের resolution এখন CSS px (DPR গুণ করবেন না)
      (uniforms.u_resolution.value as THREE.Vector2).set(size.x, size.y);
    };

    const projectPoints = () => {
      const count = Math.min(MAX_POINTS, points.length);
      (uniforms.u_ptsCount.value as number) = count;

      const xs = uniforms.u_ptsX.value as number[];
      const ys = uniforms.u_ptsY.value as number[];
      const vs = uniforms.u_ptsVal.value as number[];

      for (let i = 0; i < count; i++) {
        const p = points[i];
        const pt = map.latLngToContainerPoint([p.lat, p.lng]); // CSS px
        xs[i] = pt.x;
        ys[i] = pt.y;
        vs[i] = p.value;
      }
      for (let i = count; i < MAX_POINTS; i++) {
        xs[i] = 0; ys[i] = 0; vs[i] = 0;
      }

      (uniforms.u_absMin.value as number) = minValue;
      (uniforms.u_absMax.value as number) = maxValue;
    };

    const draw = () => {
      renderer.render(scene, camera);
    };

    // first paint
    setSize();
    projectPoints();
    draw();

    const onResize = () => { setSize(); projectPoints(); draw(); };
    const onMove = () => { projectPoints(); draw(); };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, enabled, opacity, timelineKey, minValue, maxValue, /* points array ref changes */]);

  // points কন্টেন্ট পাল্টালে (length/coords/value) রেপেইন্ট
  React.useEffect(() => {
    if (!glRef.current) return;
    // সহজতম: প্রজেক্ট + রেন্ডার আবার
    const { material, renderer, scene, camera } = glRef.current;
    const u = material.uniforms;
    const MAX_POINTS = (u.u_ptsX.value as number[]).length;

    const mapObj = (map as unknown as LeafletMap);
    const count = Math.min(MAX_POINTS, points.length);
    (u.u_ptsCount.value as number) = count;

    const xs = u.u_ptsX.value as number[];
    const ys = u.u_ptsY.value as number[];
    const vs = u.u_ptsVal.value as number[];

    for (let i = 0; i < count; i++) {
      const p = points[i];
      const pt = mapObj.latLngToContainerPoint([p.lat, p.lng]);
      xs[i] = pt.x; ys[i] = pt.y; vs[i] = p.value;
    }
    for (let i = count; i < MAX_POINTS; i++) { xs[i] = 0; ys[i] = 0; vs[i] = 0; }

    renderer.render(scene, camera);
  }, [points, map]);

  // opacity লাইভ আপডেট
  React.useEffect(() => {
    if (!glRef.current) return;
    glRef.current.material.uniforms.u_opacity.value = opacity;
    glRef.current.renderer.render(glRef.current.scene, glRef.current.camera);
  }, [opacity]);

  return null;
}
