'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { REGION_VIEW, VN_OUTLINE, insideOutline, type MapDestination, type Region } from '@/lib/map/geo'
import { prefersReducedMotion } from '@/lib/motion'
import { landFragment, landVertex, seaFragment, seaVertex } from './shaders'

type Props = {
  destinations: MapDestination[]
  region: Region
  selectedId: string | null
  /** Destination to fly the camera to; null keeps the region view. */
  focusId?: string | null
  onSelect: (id: string) => void
  onReady?: () => void
  /** Fraction of the width on the left kept clear for the hero text: labels there are hidden and the view shifts right. */
  safeLeft?: number
  /** 'selected' shows only the chosen destination's label (compact hero); 'all' labels every pin. */
  labels?: 'all' | 'selected'
}

const X = (lon: number) => lon - 106
const Z = (lat: number) => -(lat - 16)
const DEPTH = 0.35
const COAST: [number, number][] = [[107.97, 21.54], [106.1, 20.2], [105.8, 18.6], [107.2, 16.8], [108.9, 15.0], [109.2, 12.3], [106.8, 10.3], [104.8, 8.6]]

function viewFor(lon: number, lat: number, d: number, shift = 0) {
  // Looking at a point left of the target puts the target in the right part of the frame.
  const t = new THREE.Vector3(X(lon) - d * shift, 0, Z(lat))
  return { t, p: t.clone().add(new THREE.Vector3(-d * 0.18, d * 0.78, d * 0.62)) }
}

function shapeFrom(pts: [number, number][]) {
  const s = new THREE.Shape()
  pts.forEach(([lo, la], i) => (i ? s.lineTo(lo - 106, la - 16) : s.moveTo(lo - 106, la - 16)))
  return s
}

const ellipse = (lo: number, la: number, rx: number, ry: number, n = 14): [number, number][] =>
  Array.from({ length: n }, (_, i) => [lo + rx * Math.cos((i / n) * 2 * Math.PI), la + ry * Math.sin((i / n) * 2 * Math.PI)])

/**
 * Interactive 3D Vietnam map: extruded land with a latitude-tinted GLSL material, animated sea,
 * instanced mountains, pins with HTML labels (incl. Hoàng Sa and Trường Sa), GSAP camera flights.
 */
export function VietnamMap3D({ destinations, region, selectedId, focusId = null, onSelect, onReady, safeLeft = 0, labels = 'all' }: Props) {
  const shift = safeLeft * 0.4
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const api = useRef<{ fly: (lon: number, lat: number, d: number) => void; setSelected: (id: string | null) => void } | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const layer = labelsRef.current
    if (!canvas || !wrap || !layer) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      return // No WebGL: the static hero art behind the canvas stays visible.
    }
    const reduce = prefersReducedMotion()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 820 ? 1.5 : 2))

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0f1e1a, 18, 42)
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
    scene.add(new THREE.HemisphereLight(0xcfe9de, 0x0f1e1a, 0.8))

    const uniforms = {
      uTime: { value: 0 },
      uNorth: { value: new THREE.Color(0x2a8a67) },
      uSouth: { value: new THREE.Color(0x3f9d6f) },
      uRim: { value: new THREE.Color(0x9fe3c4) },
      uCam: { value: new THREE.Vector3() },
    }
    const seaUniforms = {
      uTime: uniforms.uTime,
      uDeep: { value: new THREE.Color(0x0f1e1a) },
      uLine: { value: new THREE.Color(0x5fbf98) },
      uCoast: { value: COAST.map(([lo, la]) => new THREE.Vector2(X(lo), Z(la))) },
    }

    const sea = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.ShaderMaterial({ uniforms: seaUniforms, vertexShader: seaVertex, fragmentShader: seaFragment }),
    )
    sea.rotation.x = -Math.PI / 2
    sea.position.y = -0.02
    scene.add(sea)

    const landMat = new THREE.ShaderMaterial({ uniforms, vertexShader: landVertex, fragmentShader: landFragment })
    const disposables: { dispose: () => void }[] = [landMat, sea.geometry, sea.material as THREE.Material]
    const addLand = (pts: [number, number][]) => {
      const g = new THREE.ExtrudeGeometry(shapeFrom(pts), { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2 })
      const m = new THREE.Mesh(g, landMat)
      m.rotation.x = -Math.PI / 2
      scene.add(m)
      disposables.push(g)
    }
    addLand(VN_OUTLINE)
    addLand(ellipse(103.97, 10.25, 0.16, 0.28)) // Phú Quốc
    addLand(ellipse(106.6, 8.7, 0.07, 0.05, 8)) // Côn Đảo

    let seed = 7
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
    const isleGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.12, 6)
    disposables.push(isleGeo)
    const islets = (lo: number, la: number, n: number, spread: number) => {
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(isleGeo, landMat)
        m.position.set(X(lo + (rnd() - 0.5) * spread), 0.06, Z(la + (rnd() - 0.5) * spread))
        scene.add(m)
      }
    }
    islets(111.8, 16.5, 9, 1.2)
    islets(114.0, 9.8, 12, 2.2)

    // Mountains: taller in the north-west, lower in the central highlands.
    seed = 42
    const peaks: [number, number, number][] = []
    for (let k = 0; k < 4000 && peaks.length < 240; k++) {
      const lo = 102.2 + rnd() * 7.2
      const la = 8.6 + rnd() * 14.8
      if (!insideOutline(lo, la)) continue
      let h = 0
      if (la > 20.4 && lo < 106.6) h = 0.08 + rnd() * 0.22 * (lo < 104.6 ? 1.25 : 0.8)
      else if (la > 11.4 && la < 15.2 && lo > 107.4 && lo < 108.8) h = 0.05 + rnd() * 0.12
      else if (la > 15.2 && la < 20.4 && rnd() < 0.5 && !insideOutline(lo + 0.45, la)) h = 0.05 + rnd() * 0.12
      if (h > 0) peaks.push([lo, la, h])
    }
    const cone = new THREE.ConeGeometry(0.13, 1, 5)
    const peakMat = new THREE.MeshLambertMaterial({ color: 0x1f6b54, flatShading: true })
    const peakMesh = new THREE.InstancedMesh(cone, peakMat, peaks.length)
    const mtx = new THREE.Matrix4()
    peaks.forEach(([lo, la, h], i) => {
      mtx.compose(
        new THREE.Vector3(X(lo), DEPTH + h / 2, Z(la)),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rnd() * 6, 0)),
        new THREE.Vector3(0.8 + h * 1.5, h, 0.8 + h * 1.5),
      )
      peakMesh.setMatrixAt(i, mtx)
    })
    scene.add(peakMesh)
    disposables.push(cone, peakMat)

    // Pins and labels.
    const pinGeo = new THREE.SphereGeometry(0.13, 16, 12)
    const matOk = new THREE.MeshBasicMaterial({ color: 0xef6a4c })
    const matOff = new THREE.MeshBasicMaterial({ color: 0x7f8f89 })
    disposables.push(pinGeo, matOk, matOff)
    type Pin = { d: MapDestination; mesh: THREE.Mesh; top: THREE.Vector3; el: HTMLButtonElement }
    const pins: Pin[] = destinations.map((d) => {
      const h = d.verified ? 0.5 : 0.28
      const mesh = new THREE.Mesh(pinGeo, d.verified ? matOk : matOff)
      mesh.position.set(X(d.lon), DEPTH + 0.05 + h, Z(d.lat))
      if (!d.verified) mesh.scale.setScalar(0.7)
      scene.add(mesh)
      const el = document.createElement('button')
      el.type = 'button'
      el.textContent = d.name.split(' (')[0]
      el.className = `tm-map-label${d.verified ? '' : ' is-off'}`
      el.addEventListener('click', () => onSelectRef.current(d.id))
      layer.appendChild(el)
      return { d, mesh, top: mesh.position.clone(), el }
    })
    const isles = [
      { name: 'QĐ. Hoàng Sa (Việt Nam)', p: new THREE.Vector3(X(111.8), 0.3, Z(16.5)) },
      { name: 'QĐ. Trường Sa (Việt Nam)', p: new THREE.Vector3(X(114.0), 0.3, Z(9.8)) },
    ].map((i) => {
      const el = document.createElement('span')
      el.className = 'tm-map-label is-isle'
      el.textContent = i.name
      layer.appendChild(el)
      return { ...i, el }
    })

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 3
    controls.maxDistance = 30
    controls.maxPolarAngle = Math.PI * 0.44
    controls.enablePan = false
    const start = viewFor(REGION_VIEW.all.lon, REGION_VIEW.all.lat, REGION_VIEW.all.d, shift)
    camera.position.copy(start.p)
    controls.target.copy(start.t)

    let flight: gsap.core.Timeline | null = null
    const fly = (lon: number, lat: number, d: number) => {
      const v = viewFor(lon, lat, d, shift)
      flight?.kill()
      if (reduce) {
        camera.position.copy(v.p)
        controls.target.copy(v.t)
        return
      }
      flight = gsap
        .timeline({ defaults: { duration: 1.2, ease: 'power3.inOut' } })
        .to(camera.position, { x: v.p.x, y: v.p.y, z: v.p.z }, 0)
        .to(controls.target, { x: v.t.x, y: v.t.y, z: v.t.z }, 0)
    }
    const setSelected = (id: string | null) => {
      pins.forEach((p) => {
        const on = p.d.id === id
        p.el.classList.toggle('is-selected', on)
        p.el.setAttribute('aria-pressed', String(on))
        gsap.to(p.mesh.scale, { x: on ? 1.3 : p.d.verified ? 1 : 0.7, y: on ? 1.3 : p.d.verified ? 1 : 0.7, z: on ? 1.3 : p.d.verified ? 1 : 0.7, duration: reduce ? 0 : 0.3 })
      })
    }
    api.current = { fly, setSelected }

    // Tap a pin on the canvas.
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let down: [number, number] | null = null
    const onDown = (e: PointerEvent) => (down = [e.clientX, e.clientY])
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return
      const r = canvas.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(pins.map((p) => p.mesh))[0]
      const pin = hit && pins.find((p) => p.mesh === hit.object)
      if (pin) onSelectRef.current(pin.d.id)
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)

    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()

    // Only render while visible on screen and the tab is in front.
    let onScreen = true
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting))
    io.observe(wrap)
    const tmp = new THREE.Vector3()
    const place = (el: HTMLElement, p: THREE.Vector3, show: boolean) => {
      tmp.copy(p).project(camera)
      const sx = tmp.x * 0.5 + 0.5
      const vis = show && tmp.z < 1 && sx > safeLeft && sx < 0.98 && tmp.y < 0.85 && tmp.y > -0.55
      el.hidden = !vis
      if (vis) el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * wrap.clientWidth}px, ${(-tmp.y * 0.5 + 0.5) * wrap.clientHeight}px) translate(-50%, -170%)`
    }
    const clock = new THREE.Clock()
    let raf = 0
    let first = true
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!onScreen || document.hidden) return
      if (!reduce) uniforms.uTime.value = clock.getElapsedTime()
      controls.update()
      uniforms.uCam.value.copy(camera.position)
      renderer.render(scene, camera)
      const dist = camera.position.distanceTo(controls.target)
      pins.forEach((p) => place(p.el, p.top, p.el.classList.contains('is-selected') || (labels === 'all' && (p.d.verified ? dist < 16 : dist < 9))))
      isles.forEach((i) => place(i.el, i.p, labels === 'all' || dist > 14))
      if (first) {
        first = false
        onReady?.()
      }
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      flight?.kill()
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      controls.dispose()
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      layer.replaceChildren()
      api.current = null
    }
    // The scene is built once per destination list; region and selection go through `api`.
  }, [destinations, onReady, safeLeft, shift, labels])

  useEffect(() => {
    const r = REGION_VIEW[region]
    api.current?.fly(r.lon, r.lat, r.d)
  }, [region, destinations])

  useEffect(() => {
    api.current?.setSelected(selectedId)
  }, [selectedId, destinations])

  useEffect(() => {
    const d = destinations.find((x) => x.id === focusId)
    if (d) api.current?.fly(d.lon, d.lat, d.verified ? 7 : 8)
  }, [focusId, destinations])

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block size-full touch-none" aria-hidden />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto" />
    </div>
  )
}
