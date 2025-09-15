"use client";

import * as React from "react";
import * as THREE from "three";
import { useMap } from "react-leaflet";

type Props = {
  enabled?: boolean;
  forecast?: boolean; // 🔥 if true → forecast color palette
};

export default function TemperatureField({ enabled = true, forecast = false }: Props) {
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

    const overlayPane = map.getPanes().overlayPane;
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "450";
    overlayPane.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_mode: { value: forecast ? 1 : 0 },
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
      uniform vec2 u_resolution;
      uniform int u_mode;

      // two palettes: observed vs forecast
      vec3 paletteObserved(float t) {
        return mix(vec3(0.0,0.4,0.8), vec3(0.3,0.9,0.6), t);
      }
      vec3 paletteForecast(float t) {
        return mix(vec3(1.0,0.8,0.2), vec3(0.9,0.2,0.1), t);
      }

      void main() {
        vec2 uv = vUv;
        float wave = 0.5 + 0.5 * sin(uv.x*10.0 + u_time);
        float shade = mix(uv.y, wave, 0.3);

        vec3 col = (u_mode == 1) ? paletteForecast(shade) : paletteObserved(shade);
        gl_FragColor = vec4(col, 0.6);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
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
      uniforms.u_resolution.value.set(size.x * dpr, size.y * dpr);
    };

    resize();
    const animate = (t: number) => {
      uniforms.u_time.value = t * 0.001;
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    map.on("resize move zoom", resize);

    return () => {
      map.off("resize move zoom", resize);
      glRef.current?.destroy();
      glRef.current = null;
    };
  }, [map, enabled, forecast]);

  return null;
}
