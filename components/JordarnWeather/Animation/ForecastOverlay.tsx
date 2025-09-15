"use client";

import * as React from "react";
import * as THREE from "three";
import { useMap } from "react-leaflet";

/** Match your sidebar ids */
export type ForecastLayerId =
    | "forecast-temp"
    | "forecast-humidity"
    | "forecast-wind"
    | "pressure-isolines"
    | "msl-pressure"
    | "geopotential"
    | "forecast-dewpoint"
    | "low-clouds"
    | "total-clouds";

type Props = {
    layerId: ForecastLayerId;
    enabled?: boolean;
    opacity?: number;     // 0..1 alpha
    isPlaying?: boolean;  // animation gate
    timelineKey?: number; // use your currentIndex/date idx
};

export default function ForecastOverlay({
    layerId,
    enabled = true,
    opacity = 0.6,
    isPlaying = false,
    timelineKey = 0,
}: Props) {
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

    const mode = React.useMemo<number>(() => {
        const index: Record<ForecastLayerId, number> = {
            "forecast-temp": 0,
            "forecast-humidity": 1,
            "forecast-wind": 2,
            "pressure-isolines": 3,
            "msl-pressure": 4,
            "geopotential": 5,
            "forecast-dewpoint": 6,
            "low-clouds": 7,
            "total-clouds": 8,
        };
        return index[layerId] ?? 0;
    }, [layerId]);

    React.useEffect(() => {
        if (!enabled) return;

        // attach canvas to Leaflet overlay pane
        const overlayPane = map.getPanes().overlayPane;
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.left = "0";
        canvas.style.top = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "450";
        overlayPane.appendChild(canvas);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            premultipliedAlpha: false,
        });
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        renderer.setPixelRatio(dpr);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geo = new THREE.PlaneGeometry(2, 2);

        const uniforms: Record<string, THREE.IUniform> = {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(1, 1) },
            u_mode: { value: mode },
            u_opacity: { value: opacity },
            u_anim: { value: isPlaying ? 1 : 0 },
            u_phase: { value: timelineKey },
        };

        const vert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

        const frag = `
      precision mediump float;

      varying vec2 vUv;
      uniform float u_time;
      uniform vec2  u_resolution;
      uniform int   u_mode;
      uniform float u_opacity;
      uniform float u_anim;   // 0 or 1
      uniform float u_phase;  // timeline step

      // ----------- noise helpers -----------
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        vec2 u=f*f*(3.0-2.0*f);
        float a=hash(i+vec2(0,0));
        float b=hash(i+vec2(1,0));
        float c=hash(i+vec2(0,1));
        float d=hash(i+vec2(1,1));
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }
      float fbm(vec2 p){
        float v=0.0, a=0.5;
        for(int i=0;i<5;i++){ v += a*noise(p); p*=2.0; a*=0.5; }
        return v;
      }

      // ----------- color ramps -----------
      vec3 rampWarm(float t){ t=clamp(t,0.0,1.0); return mix(vec3(1.0,0.85,0.20), vec3(0.95,0.25,0.10), t); }
      vec3 rampTeal(float t){ t=clamp(t,0.0,1.0); return mix(vec3(0.00,0.70,0.80), vec3(0.20,0.95,0.60), t); }
      vec3 rampBlueMagenta(float t){ t=clamp(t,0.0,1.0); return mix(vec3(0.15,0.35,0.90), vec3(0.80,0.20,1.00), t); }
      vec3 rampGreen(float t){ t=clamp(t,0.0,1.0); return mix(vec3(0.20,0.70,0.30), vec3(0.85,1.00,0.60), t); }
      vec3 rampPurple(float t){ t=clamp(t,0.0,1.0); return mix(vec3(0.48,0.40,0.90), vec3(0.10,0.08,0.25), t); }
      vec3 gray(float t){ t=clamp(t,0.0,1.0); return vec3(t); }

      // ----------- small utilities -----------
      float contour(float v, float lines) {
        float g = fract(v*lines);
        float edge = min(smoothstep(0.0,0.02,g), 1.0 - smoothstep(0.98,1.0,g));
        return edge;
      }
      mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

      // SDF line segment (distance in NDC[-1..1] cell space)
      float sdSegment(vec2 p, vec2 a, vec2 b){
        vec2 pa=p-a, ba=b-a;
        float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
        return length(pa - ba*h);
      }
      float drawLine(vec2 p, vec2 a, vec2 b, float w){
        float d = sdSegment(p,a,b);
        return 1.0 - smoothstep(w, w+0.01, d);
      }

      // ----------- MODES -----------
      vec4 shadeTemperature(vec2 uv, float tphase){
        float w = 0.5 + 0.35*sin(uv.x*6.0 + tphase*0.8) + 0.25*uv.y;
        return vec4(rampWarm(w), 1.0);
      }
      vec4 shadeHumidity(vec2 uv, float tphase){
        float n = fbm(uv*3.0 + vec2(0.0, tphase*0.05));
        return vec4(rampTeal(n), 1.0);
      }

      // NEW: Arrow-glyph wind (grid ~40px)
      vec4 shadeWind(vec2 uv, float tphase){
        // convert to pixel space so grid is pixel-consistent
        vec2 px = uv * u_resolution;
        float cell = 40.0;                 // grid size in pixels
        vec2 gid  = floor(px / cell);      // cell id
        vec2 guv  = fract(px / cell) - 0.5;// local coords [-0.5..0.5]

        // timeline phase + play animation
        float t = tphase * u_anim;

        // vector field from fbm; stable per cell id
        float ang = 6.28318 * noise(gid*0.35 + vec2(0.10*t, -0.07*t));
        // tiny drift inside cell when playing
        vec2 drift = (u_anim > 0.5) ? 0.08 * vec2(sin(t*0.6), cos(t*0.5)) : vec2(0.0);
        vec2 p = (guv + drift) * 2.0;      // local NDC [-1..1] in cell

        // rotate local space so arrow points "up" (y+)
        p = rot(-ang) * p;

        // arrow geometry (stem + two head lines)
        float stem  = drawLine(p, vec2(0.0,-0.45), vec2(0.0,0.12), 0.045);
        float headL = drawLine(p, vec2(0.0, 0.35), vec2(-0.18,0.10), 0.055);
        float headR = drawLine(p, vec2(0.0, 0.35), vec2( 0.18,0.10), 0.055);

        float arrow = clamp(stem + headL + headR, 0.0, 1.0);

        // soft fade toward cell edges (anti-alias)
        float vign = smoothstep(0.52, 0.30, length(guv));

        // color: light ink on blue background
        vec3 bg  = vec3(0.10,0.18,0.40);
        vec3 ink = vec3(0.92,0.95,1.00);

        vec3 col = mix(bg, ink, arrow * vign);

        // Slight per-cell shading for depth
        float shade = 0.06 * (fbm(gid*0.5) - 0.5);
        col += shade;

        // final alpha: mostly opaque glyphs, but let map show through
        float a = mix(0.0, 0.90, arrow * vign);
        return vec4(col, a);
      }

      vec4 shadePressureIsolines(vec2 uv, float tphase){
        float t = tphase * (0.3 * u_anim);
        float field = fbm(uv*3.0 + vec2(t,-t));
        float lines = contour(field, 18.0);
        vec3 base = vec3(0.15,0.20,0.32);
        vec3 lineCol = mix(vec3(0.0), vec3(0.05), 0.2);
        vec3 col = mix(base, lineCol, lines*0.9);
        float hi = smoothstep(0.495, 0.5, abs(fract(field*18.0)-0.5));
        col += vec3(0.25) * hi * 0.2;
        return vec4(col, 0.95);
      }

      vec4 shadeMSL(vec2 uv, float tphase){
        float t = tphase * (0.25 * u_anim);
        float field = fbm(uv*2.2 + vec2(t, t*0.3));
        vec3 col = rampBlueMagenta(field);
        float lines = contour(field, 14.0);
        col = mix(col, col*0.25, lines*0.8);
        return vec4(col, 0.95);
      }

      vec4 shadeGeopotential(vec2 uv, float tphase){
        float t = tphase * (0.2 * u_anim);
        float f = fbm(uv*2.8 + vec2(0.2*t, -0.15*t));
        float dx = fbm((uv+vec2(0.002,0.0))*2.8) - f;
        float dy = fbm((uv+vec2(0.0,0.002))*2.8) - f;
        float shade = clamp(0.6 + 2.5 * (dx*0.6 - dy*0.8), 0.0, 1.0);
        vec3 base = rampPurple(f);
        vec3 lit  = base * (0.65 + 0.35 * shade);
        float lines = contour(f, 10.0);
        lit = mix(lit, lit*0.25, lines*0.7);
        return vec4(lit, 0.95);
      }

      vec4 shadeDewpoint(vec2 uv, float tphase){
        float t = tphase * (0.22 * u_anim);
        float v = 0.55*fbm(uv*2.0 + vec2(0.0,0.02*t)) + 0.45*uv.y;
        return vec4(rampGreen(v), 0.95);
      }

     // common cloud field; now advects from LEFT/TOP-LEFT → RIGHT
vec4 cloudsCommon(vec2 uv, float tphase, float density){
  // animation gate (0 when paused, 1 when playing)
  float play = u_anim;

  // pick a drift direction that comes from upper-left and moves rightwards
  // (visual motion is opposite to the sampling offset)
  // dir ~ (+x, -y) => move down-right; we sample with NEGATIVE dir to move visually right
  vec2 dir = normalize(vec2(1.0, -0.35));

  // speed knobs (tphase already folds time + timeline)
  float speed = 0.08;

  // shift sampling space; negative to make visible motion to the right
  vec2 advect = -dir * speed * tphase * play;

  // fbm field
  float c = fbm(uv*3.0 + advect);

  // stronger billows toward left at the start (soft “entry” from left/top-left)
  // mask pushes opacity higher on left edge and slightly top edge
  float edgeMask = smoothstep(0.0, 0.6, 1.0 - uv.x) * smoothstep(0.0, 0.85, uv.y + 0.15);
  c = smoothstep(0.35, 1.0, c * density);
  c = clamp(c + 0.35 * edgeMask * play, 0.0, 1.0);

  vec3 col = mix(gray(0.5), gray(1.0), c);
  return vec4(col, c);
}

vec4 shadeLowClouds(vec2 uv, float tphase){
  vec4 c = cloudsCommon(uv, tphase, 0.80);
  c.a *= 0.50;
  return c;
}

vec4 shadeTotalClouds(vec2 uv, float tphase){
  vec4 c = cloudsCommon(uv, tphase, 1.25);
  c.a = min(0.85, c.a * 1.20); // denser than low clouds
  return c;
}

      void main(){
        vec2 uv = vUv;
        float tphase = u_time + u_phase * 7.0;

        vec4 outc;
        if (u_mode == 0)      outc = shadeTemperature(uv, tphase);
        else if (u_mode == 1) outc = shadeHumidity(uv, tphase);
        else if (u_mode == 2) outc = shadeWind(uv, tphase);
        else if (u_mode == 3) outc = shadePressureIsolines(uv, tphase);
        else if (u_mode == 4) outc = shadeMSL(uv, tphase);
        else if (u_mode == 5) outc = shadeGeopotential(uv, tphase);
        else if (u_mode == 6) outc = shadeDewpoint(uv, tphase);
        else if (u_mode == 7) outc = shadeLowClouds(uv, tphase);
        else                  outc = shadeTotalClouds(uv, tphase);

        gl_FragColor = vec4(outc.rgb, outc.a * u_opacity);
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
                renderer.setAnimationLoop(null);
                scene.remove(mesh);
                material.dispose();
                geo.dispose();
                renderer.dispose();
                canvas.remove();
            },
        };

        const resize = () => {
            const size = map.getSize();
            renderer.setSize(size.x, size.y, false);
            (uniforms.u_resolution.value as THREE.Vector2).set(size.x * dpr, size.y * dpr);
        };

        resize();

        const animate = (t: number) => {
            (uniforms.u_time.value as number) = t * 0.001;
            renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(animate);

        map.on("resize move zoom", resize);

        return () => {
            map.off("resize move zoom", resize);
            glRef.current?.destroy();
            glRef.current = null;
        };
    }, [map, enabled, mode]);

    // live prop updates
    React.useEffect(() => {
        if (!glRef.current) return;
        (glRef.current.material.uniforms.u_opacity as THREE.IUniform).value = opacity;
    }, [opacity]);

    React.useEffect(() => {
        if (!glRef.current) return;
        (glRef.current.material.uniforms.u_anim as THREE.IUniform).value = isPlaying ? 1 : 0;
    }, [isPlaying]);

    React.useEffect(() => {
        if (!glRef.current) return;
        (glRef.current.material.uniforms.u_phase as THREE.IUniform).value = timelineKey ?? 0;
    }, [timelineKey]);

    return null;
}
