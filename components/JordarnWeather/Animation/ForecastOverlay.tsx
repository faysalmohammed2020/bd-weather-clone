"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { useMap } from "react-leaflet";

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
  opacity?: number;
  isPlaying?: boolean;
  timelineKey?: number;
};

type LayerMeta = {
  title: string;
  unit: string;
  ticks: string[];
  gradient: string;
};

const LAYER_INDEX: Record<ForecastLayerId, number> = {
  "forecast-temp": 0,
  "forecast-humidity": 1,
  "forecast-wind": 2,
  "pressure-isolines": 3,
  "msl-pressure": 4,
  geopotential: 5,
  "forecast-dewpoint": 6,
  "low-clouds": 7,
  "total-clouds": 8,
};

const LAYER_META: Record<ForecastLayerId, LayerMeta> = {
  "forecast-temp": {
    title: "Temperature",
    unit: "°C",
    ticks: ["-10", "0", "15", "30", "45"],
    gradient:
      "linear-gradient(90deg,#54278f,#2c7fb8,#41b6c4,#7fcdbb,#ffffb2,#fe9929,#d7301f)",
  },
  "forecast-humidity": {
    title: "Relative humidity",
    unit: "%",
    ticks: ["0", "25", "50", "75", "100"],
    gradient: "linear-gradient(90deg,#f4e8c1,#9dd9c5,#45b8ac,#168aad,#184e77)",
  },
  "forecast-wind": {
    title: "Wind speed & direction",
    unit: "km/h",
    ticks: ["0", "15", "30", "50", "75+"],
    gradient:
      "linear-gradient(90deg,#273b73,#2368a2,#18a999,#a7c957,#f4a261,#d1495b)",
  },
  "pressure-isolines": {
    title: "Pressure isolines",
    unit: "hPa",
    ticks: ["980", "995", "1010", "1025", "1040"],
    gradient: "linear-gradient(90deg,#536976,#8da0ad,#d6e1e8,#f7fbff)",
  },
  "msl-pressure": {
    title: "Mean sea-level pressure",
    unit: "hPa",
    ticks: ["980", "995", "1010", "1025", "1040"],
    gradient:
      "linear-gradient(90deg,#313695,#4575b4,#74add1,#e0f3f8,#fee090,#f46d43,#a50026)",
  },
  geopotential: {
    title: "500 hPa geopotential",
    unit: "dam",
    ticks: ["500", "530", "560", "590", "620"],
    gradient:
      "linear-gradient(90deg,#2d1e5f,#51368d,#7b52ab,#b267a5,#e08b79,#f7c873)",
  },
  "forecast-dewpoint": {
    title: "Dew point",
    unit: "°C",
    ticks: ["-10", "0", "10", "20", "30"],
    gradient: "linear-gradient(90deg,#725a40,#b6ad76,#a4c3b2,#4f9d8d,#126e82)",
  },
  "low-clouds": {
    title: "Low cloud cover",
    unit: "%",
    ticks: ["0", "25", "50", "75", "100"],
    gradient: "linear-gradient(90deg,#314158,#718096,#cbd5e1,#ffffff)",
  },
  "total-clouds": {
    title: "Total cloud cover",
    unit: "%",
    ticks: ["0", "25", "50", "75", "100"],
    gradient: "linear-gradient(90deg,#172033,#526075,#a8b2c1,#ffffff)",
  },
};

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;
  uniform float u_time;
  uniform float u_phase;
  uniform float u_opacity;
  uniform float u_playback;
  uniform int u_mode;
  uniform vec2 u_resolution;
  uniform vec4 u_bounds;

  const float PI = 3.14159265359;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }

  vec3 spectral(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.16, 0.20, 0.46);
    vec3 c1 = vec3(0.09, 0.47, 0.68);
    vec3 c2 = vec3(0.08, 0.68, 0.58);
    vec3 c3 = vec3(0.67, 0.79, 0.31);
    vec3 c4 = vec3(0.96, 0.57, 0.24);
    vec3 c5 = vec3(0.76, 0.16, 0.28);
    if (t < 0.2) return mix(c0, c1, t / 0.2);
    if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
    if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
    if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
    return mix(c4, c5, (t - 0.8) / 0.2);
  }

  vec3 temperatureRamp(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 cold = mix(vec3(0.28, 0.08, 0.52), vec3(0.08, 0.55, 0.77), smoothstep(0.0, 0.36, t));
    vec3 mild = mix(cold, vec3(0.38, 0.78, 0.57), smoothstep(0.28, 0.52, t));
    vec3 warm = mix(mild, vec3(1.0, 0.86, 0.28), smoothstep(0.48, 0.72, t));
    return mix(warm, vec3(0.80, 0.10, 0.12), smoothstep(0.68, 1.0, t));
  }

  vec3 humidityRamp(float t) {
    return mix(
      mix(vec3(0.91, 0.82, 0.59), vec3(0.24, 0.72, 0.65), smoothstep(0.0, 0.55, t)),
      vec3(0.05, 0.24, 0.49),
      smoothstep(0.5, 1.0, t)
    );
  }

  vec3 pressureRamp(float t) {
    vec3 low = vec3(0.17, 0.22, 0.58);
    vec3 middle = vec3(0.78, 0.91, 0.93);
    vec3 high = vec3(0.73, 0.05, 0.12);
    return t < 0.5 ? mix(low, middle, t * 2.0) : mix(middle, high, (t - 0.5) * 2.0);
  }

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float scalarField(vec2 p, float phase) {
    float synoptic = 0.50
      + 0.20 * sin(p.x * 1.18 + p.y * 0.72 + phase * 0.34)
      + 0.13 * cos(p.x * 0.54 - p.y * 1.36 - phase * 0.23)
      + 0.16 * (fbm(p * 1.22 + vec2(phase * 0.055, -phase * 0.035)) - 0.5);
    return clamp(synoptic, 0.0, 1.0);
  }

  vec2 windField(vec2 p, float phase) {
    float a = 1.3 * sin(p.y * 0.62 + phase * 0.16)
      + 0.85 * cos(p.x * 0.48 - phase * 0.11)
      + (fbm(p * 0.72 + phase * 0.025) - 0.5) * 2.4;
    vec2 direction = vec2(cos(a), sin(a));
    float speed = 0.28 + 0.72 * scalarField(p + vec2(0.7, -0.4), phase);
    return direction * speed;
  }

  float isoline(float value, float count, float width) {
    float d = abs(fract(value * count) - 0.5);
    return 1.0 - smoothstep(width, width + fwidth(value * count), d);
  }

  float particleLayer(vec2 uv, vec2 p, float phase, float gridSize, float brightness) {
    vec2 px = uv * u_resolution;
    vec2 cellId = floor(px / gridSize);
    vec2 cellUv = fract(px / gridSize) - 0.5;
    vec2 cellCenterUv = (cellId + 0.5) * gridSize / u_resolution;
    vec2 cellWorld = vec2(
      mix(u_bounds.x, u_bounds.z, cellCenterUv.x),
      mix(u_bounds.y, u_bounds.w, cellCenterUv.y)
    );
    cellWorld = (cellWorld - vec2(36.0, 31.0)) * vec2(1.3, 1.05);
    vec2 flow = windField(cellWorld, phase);
    float angle = atan(flow.y, flow.x);
    vec2 local = rotate2d(-angle) * cellUv;
    float seed = hash(cellId + floor(phase) * 0.17);
    float speed = 0.22 + length(flow) * 0.42;
    float head = fract(local.x - u_time * speed * (1.0 + u_playback * 0.20) + seed) - 0.5;
    float along = 1.0 - smoothstep(0.04, 0.25, abs(head));
    float across = 1.0 - smoothstep(0.018, 0.055, abs(local.y));
    float taper = smoothstep(-0.23, 0.02, head);
    return along * across * taper * brightness * (0.45 + 0.55 * length(flow));
  }

  void main() {
    vec2 lonLat = vec2(
      mix(u_bounds.x, u_bounds.z, vUv.x),
      mix(u_bounds.y, u_bounds.w, vUv.y)
    );
    vec2 p = (lonLat - vec2(36.0, 31.0)) * vec2(1.3, 1.05);
    float phase = u_phase;
    float field = scalarField(p, phase);
    vec2 flow = windField(p, phase);
    float windSpeed = clamp(length(flow), 0.0, 1.0);
    vec3 color = vec3(0.0);
    float alpha = 0.78;
    float particles = 0.0;

    if (u_mode == 0) {
      float latitudeCooling = (32.8 - lonLat.y) * 0.055;
      float diurnal = 0.055 * sin(phase * 0.9 + p.x * 0.35);
      float value = clamp(field * 0.68 + latitudeCooling + diurnal, 0.0, 1.0);
      color = temperatureRamp(value);
      particles = particleLayer(vUv, p, phase, 37.0, 0.26);
      alpha = 0.72;
    } else if (u_mode == 1) {
      float moisture = clamp(0.18 + field * 0.82 - 0.08 * p.y, 0.0, 1.0);
      color = humidityRamp(moisture);
      particles = particleLayer(vUv, p, phase, 39.0, 0.20);
      alpha = 0.70;
    } else if (u_mode == 2) {
      color = spectral(windSpeed);
      particles = particleLayer(vUv, p, phase, 25.0, 1.0)
        + particleLayer(vUv + vec2(0.013, 0.009), p, phase, 43.0, 0.65);
      alpha = 0.68;
    } else if (u_mode == 3) {
      float lines = isoline(field, 17.0, 0.055);
      color = mix(vec3(0.10, 0.16, 0.24), vec3(0.93, 0.97, 1.0), lines);
      alpha = mix(0.10, 0.95, lines);
    } else if (u_mode == 4) {
      color = pressureRamp(field);
      float lines = isoline(field, 15.0, 0.042);
      color = mix(color, vec3(0.98), lines * 0.64);
      particles = particleLayer(vUv, p, phase, 42.0, 0.17);
      alpha = 0.73;
    } else if (u_mode == 5) {
      float height = clamp(field * 0.76 + 0.16 * sin(p.y * 0.75), 0.0, 1.0);
      color = mix(vec3(0.12, 0.08, 0.31), vec3(0.95, 0.66, 0.28), height);
      color = mix(color, vec3(0.95), isoline(height, 12.0, 0.045) * 0.48);
      alpha = 0.74;
    } else if (u_mode == 6) {
      float dew = clamp(field * 0.72 + 0.16 - p.y * 0.045, 0.0, 1.0);
      color = mix(vec3(0.45, 0.32, 0.18), vec3(0.03, 0.44, 0.52), dew);
      particles = particleLayer(vUv, p, phase, 41.0, 0.18);
      alpha = 0.70;
    } else {
      float drift = u_time * (u_mode == 7 ? 0.018 : 0.028) * (1.0 + u_playback * 0.18);
      vec2 advected = p * (u_mode == 7 ? 1.75 : 1.35) - flow * drift;
      float cloud = fbm(advected + vec2(phase * 0.04, -phase * 0.025));
      cloud = smoothstep(u_mode == 7 ? 0.50 : 0.40, 0.83, cloud + field * 0.18);
      vec3 shadow = vec3(0.22, 0.28, 0.36);
      color = mix(shadow, vec3(1.0), cloud);
      alpha = cloud * (u_mode == 7 ? 0.62 : 0.82);
    }

    color = mix(color, vec3(1.0), clamp(particles, 0.0, 1.0));
    alpha = max(alpha, particles * 0.92);
    float edgeFade = smoothstep(0.0, 0.018, vUv.x)
      * smoothstep(0.0, 0.018, vUv.y)
      * smoothstep(0.0, 0.018, 1.0 - vUv.x)
      * smoothstep(0.0, 0.018, 1.0 - vUv.y);
    gl_FragColor = vec4(color, alpha * u_opacity * edgeFade);
  }
`;

export default function ForecastOverlay({
  layerId,
  enabled = true,
  opacity = 0.72,
  isPlaying = false,
  timelineKey = 0,
}: Props) {
  const map = useMap();
  const mode = LAYER_INDEX[layerId];
  const meta = LAYER_META[layerId];
  const targetPhaseRef = React.useRef(timelineKey);
  const glRef = React.useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    mesh: THREE.Mesh;
    geometry: THREE.PlaneGeometry;
    material: THREE.ShaderMaterial;
    canvas: HTMLCanvasElement;
  } | null>(null);

  React.useEffect(() => {
    targetPhaseRef.current = timelineKey;
  }, [timelineKey]);

  React.useEffect(() => {
    if (!enabled) return;

    const container = map.getContainer();
    const canvas = document.createElement("canvas");
    canvas.dataset.forecastLayer = layerId;
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      pointerEvents: "none",
      zIndex: "410",
    });
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(1.75, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms: Record<string, THREE.IUniform> = {
      u_time: { value: 0 },
      u_phase: { value: targetPhaseRef.current },
      u_opacity: { value: 0.72 },
      u_playback: { value: 0 },
      u_mode: { value: mode },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_bounds: { value: new THREE.Vector4(34.8, 29.0, 39.3, 33.5) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    glRef.current = { renderer, scene, camera, mesh, geometry, material, canvas };

    const syncViewport = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const bounds = map.getBounds();
      renderer.setSize(width, height, false);
      (uniforms.u_resolution.value as THREE.Vector2).set(width * dpr, height * dpr);
      (uniforms.u_bounds.value as THREE.Vector4).set(
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      );
    };
    syncViewport();
    map.on("move zoom resize", syncViewport);
    const resizeObserver = new ResizeObserver(syncViewport);
    resizeObserver.observe(container);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = (timestamp: number) => {
      const currentPhase = uniforms.u_phase.value as number;
      const targetPhase = targetPhaseRef.current;
      uniforms.u_phase.value = currentPhase + (targetPhase - currentPhase) * 0.065;
      uniforms.u_time.value = reducedMotion ? 0 : timestamp * 0.001;
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    return () => {
      map.off("move zoom resize", syncViewport);
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
      glRef.current = null;
    };
  }, [enabled, layerId, map, mode]);

  React.useEffect(() => {
    if (!glRef.current) return;
    glRef.current.material.uniforms.u_opacity.value = opacity;
  }, [opacity]);

  React.useEffect(() => {
    if (!glRef.current) return;
    glRef.current.material.uniforms.u_playback.value = isPlaying ? 1 : 0;
  }, [isPlaying]);

  if (!enabled) return null;

  return createPortal(
    <div
      data-forecast-legend={layerId}
      className="pointer-events-none absolute bottom-28 right-3 z-[850] w-[min(21rem,calc(100%-1.5rem))] rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-slate-900 shadow-2xl backdrop-blur-md transition-colors sm:bottom-20 sm:right-4 sm:w-[min(21rem,calc(100%-2rem))] dark:border-white/20 dark:bg-slate-950/90 dark:text-white"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-wide">{meta.title}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-300">Animated forecast field · {meta.unit}</div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {isPlaying ? "Forecast playing" : "Flow animation"}
        </div>
      </div>
      <div className="h-2.5 rounded-full ring-1 ring-slate-300 dark:ring-white/20" style={{ background: meta.gradient }} />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-slate-600 dark:text-slate-200">
        {meta.ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>,
    map.getContainer()
  );
}
