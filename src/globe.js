// Globo 3D de red (Canvas 2D con proyección propia, sin dependencias).
// Muestra las tres regiones reales del sitio: US Virginia, EU Frankfurt y SA São Paulo.

const REGIONS = [
  { key: 'US', name: 'US Virginia', lat: 38.9, lon: -77.4, color: [34, 211, 238] },
  { key: 'EU', name: 'EU Frankfurt', lat: 50.1, lon: 8.7, color: [167, 139, 250] },
  { key: 'SA', name: 'SA São Paulo', lat: -23.5, lon: -46.6, color: [52, 211, 153] }
]
const LINKS = [[0, 1], [1, 2], [2, 0]]

const toVec = (lat, lon) => {
  const p = (lat * Math.PI) / 180
  const t = (lon * Math.PI) / 180
  return [Math.cos(p) * Math.sin(t), Math.sin(p), Math.cos(p) * Math.cos(t)]
}

function fibonacciSphere(n) {
  const pts = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r])
  }
  return pts
}

function slerp(a, b, t) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const om = Math.acos(dot)
  if (om < 1e-4) return a
  const s = Math.sin(om)
  const k1 = Math.sin((1 - t) * om) / s
  const k2 = Math.sin(t * om) / s
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]
}

export function mountGlobe(canvas, opts = {}) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dots = fibonacciSphere(opts.dots || 1700)
  const tilt = 0.38
  let w = 0, h = 0, dpr = 1
  let yaw = 1.15
  let vel = -0.0026
  let dragging = false
  let lastX = 0
  let px = 0, py = 0 // parallax
  let visible = true
  let raf = 0
  let t0 = performance.now()

  function resize() {
    const r = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = Math.max(1, r.width)
    h = Math.max(1, r.height)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function rot(v) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw)
    let x = v[0] * cy + v[2] * sy
    let z = -v[0] * sy + v[2] * cy
    let y = v[1]
    const ct = Math.cos(tilt + py * 0.18), st = Math.sin(tilt + py * 0.18)
    const y2 = y * ct - z * st
    const z2 = y * st + z * ct
    return [x, y2, z2]
  }

  function proj(v, R, cx, cy) {
    const k = 1 / (1 - v[2] * 0.18)
    return [cx + v[0] * R * k, cy - v[1] * R * k, v[2], k]
  }

  function frame(now) {
    const time = (now - t0) / 1000
    if (!dragging && !reduce) yaw += vel
    ctx.clearRect(0, 0, w, h)

    const R = Math.min(w, h) * 0.38
    const cx = w / 2 + px * 10
    const cy = h / 2

    // Halo
    const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.55)
    g.addColorStop(0, 'rgba(34,211,238,0.10)')
    g.addColorStop(0.5, 'rgba(139,92,246,0.07)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, R * 1.55, 0, Math.PI * 2)
    ctx.fill()

    // Cuerpo de la esfera
    const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R)
    body.addColorStop(0, 'rgba(30,41,82,0.55)')
    body.addColorStop(1, 'rgba(5,8,20,0.85)')
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(148,163,184,0.18)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Paralelos y meridianos
    ctx.lineWidth = 0.7
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath()
      let started = false
      for (let lon = -180; lon <= 180; lon += 6) {
        const p = rot(toVec(lat, lon))
        if (p[2] < 0) { started = false; continue }
        const s = proj(p, R, cx, cy)
        ctx.strokeStyle = 'rgba(125,211,252,0.10)'
        if (!started) { ctx.moveTo(s[0], s[1]); started = true } else ctx.lineTo(s[0], s[1])
      }
      ctx.stroke()
    }
    for (let lon = -180; lon < 180; lon += 30) {
      ctx.beginPath()
      let started = false
      for (let lat = -90; lat <= 90; lat += 6) {
        const p = rot(toVec(lat, lon))
        if (p[2] < 0) { started = false; continue }
        const s = proj(p, R, cx, cy)
        ctx.strokeStyle = 'rgba(125,211,252,0.08)'
        if (!started) { ctx.moveTo(s[0], s[1]); started = true } else ctx.lineTo(s[0], s[1])
      }
      ctx.stroke()
    }

    // Puntos
    for (let i = 0; i < dots.length; i++) {
      const p = rot(dots[i])
      const s = proj(p, R, cx, cy)
      const depth = (p[2] + 1) / 2
      if (p[2] < -0.15) {
        ctx.fillStyle = `rgba(100,116,139,${0.05 + depth * 0.05})`
        ctx.fillRect(s[0], s[1], 1, 1)
      } else {
        const a = 0.3 + depth * 0.7
        ctx.fillStyle = `rgba(190,230,255,${a})`
        const sz = 1.3 + depth * 1.5
        ctx.fillRect(s[0] - sz / 2, s[1] - sz / 2, sz, sz)
      }
    }

    // Arcos entre regiones
    const rv = REGIONS.map((r) => toVec(r.lat, r.lon))
    LINKS.forEach(([a, b], li) => {
      const steps = 48
      let prev = null
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const v = slerp(rv[a], rv[b], t)
        const lift = 1 + 0.28 * Math.sin(Math.PI * t)
        const p = rot([v[0] * lift, v[1] * lift, v[2] * lift])
        const s = proj(p, R, cx, cy)
        if (prev && (p[2] > -0.05 || prev.z > -0.05)) {
          const alpha = Math.max(0, Math.min(1, (p[2] + 0.4) / 1.2)) * 0.75
          const ca = REGIONS[a].color, cb = REGIONS[b].color
          const m = t
          const c = [0, 1, 2].map((k) => Math.round(ca[k] * (1 - m) + cb[k] * m))
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(prev.x, prev.y)
          ctx.lineTo(s[0], s[1])
          ctx.stroke()
        }
        prev = { x: s[0], y: s[1], z: p[2] }
      }
      // Paquete viajando
      const tt = ((time * 0.22 + li * 0.33) % 1)
      const v = slerp(rv[a], rv[b], tt)
      const lift = 1 + 0.28 * Math.sin(Math.PI * tt)
      const p = rot([v[0] * lift, v[1] * lift, v[2] * lift])
      if (p[2] > -0.05) {
        const s = proj(p, R, cx, cy)
        const gg = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], 9)
        gg.addColorStop(0, 'rgba(255,255,255,0.95)')
        gg.addColorStop(0.35, 'rgba(125,211,252,0.55)')
        gg.addColorStop(1, 'rgba(125,211,252,0)')
        ctx.fillStyle = gg
        ctx.beginPath()
        ctx.arc(s[0], s[1], 9, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Marcadores de región
    REGIONS.forEach((r, i) => {
      const p = rot(rv[i])
      if (p[2] < 0.02) return
      const s = proj(p, R, cx, cy)
      const [cr, cg, cb] = r.color
      const pulse = (time * 0.9 + i * 0.4) % 1
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(1 - pulse) * 0.55})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(s[0], s[1], 4 + pulse * 18, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`
      ctx.shadowColor = `rgb(${cr},${cg},${cb})`
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.arc(s[0], s[1], 3.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      if (opts.labels !== false) {
        ctx.font = '600 11px "Plus Jakarta Sans", system-ui, sans-serif'
        const tw = ctx.measureText(r.name).width
        const lx = s[0] + 12
        const ly = s[1] - 14
        ctx.fillStyle = 'rgba(5,8,20,0.78)'
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.45)`
        ctx.lineWidth = 1
        const bw = tw + 16, bh = 22
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(lx, ly - bh / 2, bw, bh, 8)
        else ctx.rect(lx, ly - bh / 2, bw, bh)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#e2e8f0'
        ctx.textBaseline = 'middle'
        ctx.fillText(r.name, lx + 8, ly)
      }
    })

    // Brillo de borde (rim light)
    const rim = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.03)
    rim.addColorStop(0, 'rgba(56,189,248,0)')
    rim.addColorStop(1, 'rgba(56,189,248,0.22)')
    ctx.fillStyle = rim
    ctx.beginPath()
    ctx.arc(cx, cy, R * 1.03, 0, Math.PI * 2)
    ctx.fill()
  }

  function loop(now) {
    if (visible && !document.hidden) frame(now)
    raf = requestAnimationFrame(loop)
  }

  const onDown = (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture?.(e.pointerId); canvas.classList.add('is-grabbing') }
  const onUp = (e) => { dragging = false; canvas.releasePointerCapture?.(e.pointerId); canvas.classList.remove('is-grabbing') }
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect()
    px = ((e.clientX - r.left) / r.width - 0.5) * 2
    py = ((e.clientY - r.top) / r.height - 0.5) * 2
    if (dragging) { yaw += (e.clientX - lastX) * 0.008; lastX = e.clientX }
  }
  const onLeave = () => { px = 0; py = 0 }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerleave', onLeave)

  const ro = new ResizeObserver(() => { resize(); if (reduce) frame(performance.now()) })
  ro.observe(canvas)
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting })
  io.observe(canvas)
  resize()

  if (reduce) frame(performance.now())
  else raf = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerleave', onLeave)
  }
}
