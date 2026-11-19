'use client'

import type { ShaderMaterial, WebGLRenderer, Scene, OrthographicCamera, Mesh } from 'three'
import { prefersReducedMotion } from '@/lib/motion'
import { emeraldFragment, fullscreenVertex, skyFragment } from './shaders'

export type Program = 'sky' | 'emerald'
export type Uniforms = Record<string, number | [number, number, number]>

type Target = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  program: Program
  uniforms: Uniforms
  visible: boolean
  drawn: boolean
}

/**
 * One WebGL context for every animated backdrop on the page. Each backdrop is a plain 2D canvas;
 * the shared renderer draws its shader off screen and copies the pixels in. Browsers cap live
 * WebGL contexts (often 8–16), so a context per day card would break on long trips.
 * Runs at ~30 fps, only for visible targets, pauses while the tab is hidden, and draws a single
 * still frame under reduced motion.
 */
const FPS = 30
const MAX_DPR = 1.5
const targets = new Set<Target>()
let gl: {
  renderer: WebGLRenderer
  scene: Scene
  camera: OrthographicCamera
  mesh: Mesh
  materials: Record<Program, ShaderMaterial>
} | null = null
let loading: Promise<void> | null = null
let failed = false
let raf = 0
let last = 0
const start = typeof performance !== 'undefined' ? performance.now() : 0

async function init(): Promise<void> {
  const THREE = await import('three')
  const canvas = document.createElement('canvas')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(1)
  const common = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }
  const v3 = () => ({ value: new THREE.Vector3() })
  const f = () => ({ value: 0 })
  const materials: Record<Program, ShaderMaterial> = {
    sky: new THREE.ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: skyFragment,
      uniforms: { ...THREE.UniformsUtils.clone(common), uTop: v3(), uBottom: v3(), uRidge: v3(), uCloud: f(), uRain: f(), uSnow: f(), uStorm: f(), uFog: f(), uSeed: f() },
      depthTest: false,
      depthWrite: false,
    }),
    emerald: new THREE.ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: emeraldFragment,
      uniforms: THREE.UniformsUtils.clone(common),
      depthTest: false,
      depthWrite: false,
    }),
  }
  const scene = new THREE.Scene()
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), materials.sky)
  scene.add(mesh)
  gl = { renderer, scene, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mesh, materials }
}

function drawTarget(t: Target, time: number) {
  if (!gl) return
  const w = t.canvas.width
  const h = t.canvas.height
  if (w === 0 || h === 0) return
  const m = gl.materials[t.program]
  m.uniforms.uTime.value = time
  m.uniforms.uRes.value.set(w, h)
  for (const [k, v] of Object.entries(t.uniforms)) {
    const u = m.uniforms[k]
    if (!u) continue
    if (Array.isArray(v)) u.value.set(v[0], v[1], v[2])
    else u.value = v
  }
  gl.mesh.material = m
  gl.renderer.setSize(w, h, false)
  gl.renderer.render(gl.scene, gl.camera)
  t.ctx.drawImage(gl.renderer.domElement, 0, 0)
  t.drawn = true
}

function loop(now: number) {
  raf = 0
  if (document.hidden) return
  const still = prefersReducedMotion()
  if (now - last >= 1000 / FPS) {
    last = now
    const time = still ? 12 : (now - start) / 1000
    for (const t of targets) if (t.visible && (!still || !t.drawn)) drawTarget(t, time)
  }
  if (!still && [...targets].some((t) => t.visible)) raf = requestAnimationFrame(loop)
}

function kick() {
  if (!raf && gl) raf = requestAnimationFrame(loop)
}

if (typeof document !== 'undefined') document.addEventListener('visibilitychange', kick)

function sizeCanvas(t: Target) {
  const r = t.canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  const w = Math.max(1, Math.round(r.width * dpr))
  const h = Math.max(1, Math.round(r.height * dpr))
  if (t.canvas.width !== w || t.canvas.height !== h) {
    t.canvas.width = w
    t.canvas.height = h
    t.drawn = false
  }
}

/** Registers a canvas; resolves to false if WebGL is unavailable so the caller keeps its CSS fallback. */
export function attachBackdrop(
  canvas: HTMLCanvasElement,
  program: Program,
  uniforms: Uniforms,
  onReady: () => void,
): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const t: Target = { canvas, ctx, program, uniforms, visible: false, drawn: false }
  targets.add(t)
  const io = new IntersectionObserver(([e]) => {
    t.visible = e?.isIntersecting ?? false
    if (t.visible) kick()
  })
  const ro = new ResizeObserver(() => {
    sizeCanvas(t)
    kick()
  })
  io.observe(canvas)
  ro.observe(canvas)
  sizeCanvas(t)
  if (!gl && !loading && !failed) {
    loading = init().catch(() => {
      failed = true
    })
  }
  loading?.then(() => {
    if (!gl || !targets.has(t)) return
    // Draw the first frame right away so the fade-in never shows an empty canvas.
    drawTarget(t, prefersReducedMotion() ? 12 : (performance.now() - start) / 1000)
    onReady()
    kick()
  })
  return () => {
    targets.delete(t)
    io.disconnect()
    ro.disconnect()
  }
}
