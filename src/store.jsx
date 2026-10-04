import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ANNUAL_MULTIPLIER, DISCORD_URL, EXCHANGE_RATE, PROMO_CODES } from './data.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v
  } catch { return fallback }
}
const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write = (key, value) => { try { localStorage.setItem(key, value) } catch { /* sin storage */ } }

export function StoreProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => read('synthetix_currency', 'USD'))
  const [cycle, setCycleState] = useState(() => read('synthetix_billing', 'monthly'))
  const [cart, setCart] = useState(() => readJson('synthetix_cart', []))
  const [promo, setPromo] = useState(() => readJson('synthetix_promo', null))
  const [region, setRegion] = useState('US')
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [user, setUser] = useState(null)
  const toastId = useRef(0)

  useEffect(() => { write('synthetix_cart', JSON.stringify(cart)) }, [cart])

  // Sesión de Supabase (si el CDN no responde, el sitio sigue funcionando como invitado)
  useEffect(() => {
    let sub
    let alive = true
    ;(async () => {
      try {
        const { supabaseClient } = await import('../assets/js/supabaseClient.js')
        const { data } = await supabaseClient.auth.getSession()
        if (alive && data?.session?.user) setUser(data.session.user)
        const res = supabaseClient.auth.onAuthStateChange((_e, session) => alive && setUser(session?.user || null))
        sub = res?.data?.subscription
      } catch (err) { console.warn('Sesión no disponible', err) }
    })()
    return () => { alive = false; sub?.unsubscribe?.() }
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const setCurrency = (c) => { setCurrencyState(c); write('synthetix_currency', c) }
  const setCycle = (c) => { setCycleState(c); write('synthetix_billing', c) }

  const cycleMult = cycle === 'annual' ? ANNUAL_MULTIPLIER : 1
  const symbol = currency === 'EUR' ? '€' : '$'
  const rate = currency === 'EUR' ? EXCHANGE_RATE : 1

  // Precio visible de un precio base mensual en USD
  const price = useCallback((usd) => (usd * cycleMult * rate).toFixed(2), [cycleMult, rate])

  const addToCart = useCallback((name, usd) => {
    const finalUsd = usd * cycleMult
    const suffix = cycle === 'annual' ? ' (Anual)' : ''
    setCart((c) => [...c, { id: Date.now() + Math.random(), name: `${name}${suffix}`, priceUsd: finalUsd }])
    toast(`${name} añadido al carrito.`)
    setCartOpen(true)
  }, [cycle, cycleMult, toast])

  const removeFromCart = (id) => {
    const item = cart.find((i) => i.id === id)
    setCart((c) => c.filter((i) => i.id !== id))
    if (item) toast(`Se eliminó "${item.name}"`, 'info')
  }

  const applyPromo = (raw) => {
    const code = raw.trim().toUpperCase()
    if (PROMO_CODES[code] === undefined) return false
    const p = { code, discount: PROMO_CODES[code] }
    setPromo(p)
    write('synthetix_promo', JSON.stringify(p))
    toast(`Código ${code} aplicado (-${Math.round(PROMO_CODES[code] * 100)}%)`)
    return true
  }
  const removePromo = () => { setPromo(null); try { localStorage.removeItem('synthetix_promo') } catch {} }

  const totals = useMemo(() => {
    const bundle = cart.length >= 2 ? 0.9 : 1
    const promoMult = promo ? 1 - promo.discount : 1
    const sumUsd = cart.reduce((s, i) => s + i.priceUsd, 0)
    return {
      bundle, promoMult,
      item: (usd) => usd * rate * bundle * promoMult,
      total: sumUsd * rate * bundle * promoMult
    }
  }, [cart, promo, rate])

  const checkout = async () => {
    if (cart.length === 0) { toast('Tu carrito está vacío.', 'error'); return }
    const userEmail = user?.email || 'Invitado / No registrado'
    const userName = user ? user.user_metadata?.username || user.email.split('@')[0] : 'Sin sesión web'
    const promoInfo = promo ? `${promo.code} (-${Math.round(promo.discount * 100)}%)` : 'Ninguno'
    const list = cart.map((item, i) => `  ${i + 1}. ${item.name} -> ${symbol}${totals.item(item.priceUsd).toFixed(2)} ${currency}`).join('\n')
    const msg =
      `**NUEVO PEDIDO - SYNTHETIX HOST**\n` +
      `**Usuario:** ${userName}\n` +
      `**Correo:** ${userEmail}\n` +
      `**Región seleccionada:** ${region}\n` +
      `**Moneda / Modo:** ${currency} (${cycle === 'annual' ? 'Anual' : 'Mensual'})\n` +
      `**Código promo:** ${promoInfo}\n` +
      `**Servicios solicitados:**\n${list}\n` +
      `**TOTAL A PAGAR:** ${symbol}${totals.total.toFixed(2)} ${currency}\n` +
      `----------------------------------------\n` +
      `_Enviado desde la web oficial de Synthetix Host_`
    try {
      await navigator.clipboard.writeText(msg)
      toast('Orden copiada. Te llevamos a Discord para pegarla en tu ticket.')
    } catch {
      toast('No se pudo copiar. Toma una captura de tu pedido antes de ir a Discord.', 'error')
    }
    window.open(DISCORD_URL, '_blank', 'noopener')
  }

  const value = {
    currency, setCurrency, cycle, setCycle, cart, addToCart, removeFromCart, promo, applyPromo, removePromo,
    region, setRegion, cartOpen, setCartOpen, menuOpen, setMenuOpen, toasts, toast, user,
    symbol, price, totals, checkout
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
