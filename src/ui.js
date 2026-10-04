// Utilidades compartidas para las páginas estáticas (login, registro, recuperar, panel).
import { iconSvg } from './icons.js'

document.documentElement.classList.add('js')

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (el.dataset.hydrated) return
    el.innerHTML = iconSvg(el.dataset.icon, Number(el.dataset.size) || 20)
    el.dataset.hydrated = '1'
  })
}

export function toast(message, type = 'success') {
  let stack = document.getElementById('toast-root')
  if (!stack) {
    stack = document.createElement('div')
    stack.id = 'toast-root'
    document.body.appendChild(stack)
  }
  stack.classList.add('toast-stack')
  const el = document.createElement('div')
  el.className = `toast toast--${type}`
  const ico = type === 'error' ? 'x-circle' : type === 'info' ? 'info' : 'check-circle'
  el.innerHTML = `${iconSvg(ico, 18)}<span></span>`
  el.querySelector('span').textContent = message
  stack.replaceChildren(el)
  setTimeout(() => el.remove(), 6500)
}
window.synthetixToast = toast

function initPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    const input = document.getElementById(btn.dataset.togglePassword)
    if (!input) return
    btn.innerHTML = iconSvg('eye', 18)
    btn.addEventListener('click', () => {
      const show = input.type === 'password'
      input.type = show ? 'text' : 'password'
      btn.innerHTML = iconSvg(show ? 'eye-off' : 'eye', 18)
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña')
    })
  })
}

function initTilt() {
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      el.style.setProperty('--rx', `${((0.5 - y) * 5).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((x - 0.5) * 5).toFixed(2)}deg`)
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    })
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    })
  })
}

function initReveal() {
  const els = document.querySelectorAll('.reveal')
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target) } })
  }, { threshold: 0.1 })
  els.forEach((e) => io.observe(e))
}

function initGlobes() {
  const canvases = document.querySelectorAll('canvas[data-globe]')
  if (!canvases.length) return
  import('./globe.js').then((m) => canvases.forEach((c) => m.mountGlobe(c, { dots: 800, labels: c.dataset.labels !== 'false' })))
}

function initDrawer() {
  const open = document.getElementById('openDrawer')
  const close = document.getElementById('closeDrawer')
  const drawer = document.getElementById('drawer')
  const overlay = document.getElementById('drawerOverlay')
  if (!drawer || !overlay) return
  const set = (v) => { drawer.classList.toggle('is-open', v); overlay.classList.toggle('is-open', v) }
  open?.addEventListener('click', () => set(true))
  close?.addEventListener('click', () => set(false))
  overlay.addEventListener('click', () => set(false))
}

function boot() {
  hydrateIcons()
  initPasswordToggles()
  initTilt()
  initReveal()
  initGlobes()
  initDrawer()
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
else boot()
