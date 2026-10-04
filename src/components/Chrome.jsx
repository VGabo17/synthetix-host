import { useEffect, useState } from 'react'
import { CATEGORIES, DISCORD_URL, PANEL_URL } from '../data.js'
import { useStore } from '../store.jsx'
import { Icon } from './Icon.jsx'

const pad = (n) => String(n).padStart(2, '0')

export function AnnouncementBar() {
  // Cuenta regresiva que parte de 04:32:15, igual que el contador original
  const [left, setLeft] = useState(4 * 3600 + 32 * 60 + 15)
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 4 * 3600 + 32 * 60 + 15)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60
  return (
    <div className="announce">
      <span className="announce__text">
        <Icon name="tag" size={15} />
        <span>OFERTA LIMITADA. Usa el código de creador <b className="code-chip">ALEDEVV</b> y obtén 15% OFF extra en Synthetix Labs</span>
      </span>
      <span className="announce__timer">
        <Icon name="clock" size={13} /> Finaliza en: <b>{pad(h)}:{pad(m)}:{pad(s)}</b>
      </span>
    </div>
  )
}

export function Navbar({ onCategory }) {
  const { currency, setCurrency, cart, setCartOpen, setMenuOpen, user } = useStore()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const username = user ? user.user_metadata?.username || user.email.split('@')[0] : null

  return (
    <header className={`nav-wrap ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar container" aria-label="Principal">
        <a href="./" className="brand">
          <img src="./assets/img/logo.jpg" alt="" width="32" height="32" />
          <span>synthetix<em>.host</em></span>
        </a>

        <div className="nav-links">
          <a href="#productos">Planes</a>
          <a href="#dominios">Dominios</a>
          <a href="#comparativa">Comparativa</a>
          <a href="#configurador">Configurador</a>
          <a href="#soporte">Soporte</a>
          <a href={DISCORD_URL} target="_blank" rel="noopener" className="nav-discord">
            <Icon name="discord" size={16} /> Discord
          </a>
        </div>

        <div className="nav-actions">
          <label className="select-pill desktop-only">
            <span className="sr-only">Moneda</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
            <Icon name="chevron-down" size={14} />
          </label>

          <button className="icon-btn cart-btn" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
            <Icon name="cart" size={19} />
            {cart.length > 0 && <span className="cart-count" key={cart.length}>{cart.length}</span>}
          </button>

          <div className="nav-auth desktop-only">
            {user ? (
              <>
                <a href="./dashboard/" className="btn btn-ghost btn-sm"><span className="dot dot--live" /> {username}</a>
                <a href="./dashboard/" className="btn btn-primary btn-sm">Panel</a>
              </>
            ) : (
              <>
                <a href="./login/" className="btn btn-ghost btn-sm">Iniciar sesión</a>
                <a href="./register/" className="btn btn-primary btn-sm">Registrarse</a>
              </>
            )}
          </div>

          <button className="icon-btn mobile-only" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Icon name="menu" size={20} />
          </button>
        </div>
      </nav>
    </header>
  )
}

export function MobileDrawer({ onCategory }) {
  const { menuOpen, setMenuOpen, currency, setCurrency, user } = useStore()
  const close = () => setMenuOpen(false)
  const username = user ? user.user_metadata?.username || user.email.split('@')[0] : null
  const logout = async () => {
    try {
      const { supabaseClient } = await import('./assets/js/supabaseClient.js')
      await supabaseClient.auth.signOut()
    } catch {}
    window.location.reload()
  }
  return (
    <>
      <div className={`overlay ${menuOpen ? 'is-open' : ''}`} onClick={close} />
      <aside className={`drawer ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="drawer__head">
          <a href="./" className="brand"><img src="./assets/img/logo.jpg" alt="" width="28" height="28" /><span>Synthetix Host</span></a>
          <button className="icon-btn" onClick={close} aria-label="Cerrar menú"><Icon name="x" size={19} /></button>
        </div>

        <label className="field">
          <span className="field__label">Moneda de pago</span>
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </label>

        <nav className="drawer__nav">
          <span className="eyebrow-label">Navegación</span>
          {CATEGORIES.map((c) => (
            <a key={c.key} href="#productos" onClick={() => { onCategory(c.key); close() }}>
              <Icon name={c.icon} size={18} /> {c.label}
            </a>
          ))}
          <hr />
          <a href="#dominios" onClick={close}><Icon name="globe" size={18} /> Verificador de Dominios</a>
          <a href="#configurador" onClick={close}><Icon name="sliders" size={18} /> Configurador</a>
          <a href="#soporte" onClick={close}><Icon name="lifebuoy" size={18} /> Soporte</a>
          <a href={DISCORD_URL} target="_blank" rel="noopener" className="is-accent"><Icon name="discord" size={18} /> Soporte en Discord</a>
        </nav>

        <div className="drawer__foot">
          {user ? (
            <>
              <a href="./dashboard/" className="btn btn-ghost btn-wide"><Icon name="dashboard" size={17} /> Mi Panel ({username})</a>
              <button className="btn btn-danger btn-wide" onClick={logout}><Icon name="logout" size={17} /> Cerrar sesión</button>
            </>
          ) : (
            <>
              <a href="./login/" className="btn btn-ghost btn-wide">Iniciar sesión</a>
              <a href="./register/" className="btn btn-primary btn-wide">Registrarse</a>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, removeFromCart, promo, applyPromo, removePromo, totals, symbol, currency, checkout } = useStore()
  const [code, setCode] = useState('')
  const [err, setErr] = useState(false)
  const close = () => setCartOpen(false)
  const submit = (e) => {
    e.preventDefault()
    const ok = applyPromo(code)
    setErr(!ok)
    if (ok) setCode('')
  }
  return (
    <>
      <div className={`overlay ${cartOpen ? 'is-open' : ''}`} onClick={close} />
      <aside className={`drawer drawer--cart ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen}>
        <div className="drawer__head">
          <h3><Icon name="cart" size={19} /> Tu Carrito</h3>
          <button className="icon-btn" onClick={close} aria-label="Cerrar carrito"><Icon name="x" size={19} /></button>
        </div>

        <div className="drawer__body">
          {cart.length >= 2 && (
            <div className="notice notice--violet"><Icon name="layers" size={16} /> Pack Combinado: 10% de descuento automático aplicado.</div>
          )}
          {promo && (
            <div className="notice notice--green">
              <Icon name="percent" size={16} /> <span>Código {promo.code} (-{Math.round(promo.discount * 100)}%)</span>
              <button onClick={removePromo} aria-label="Quitar código"><Icon name="x" size={15} /></button>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty__icon"><Icon name="cart" size={26} /></span>
              <p>Tu carrito está vacío.</p>
              <a href="#productos" className="btn btn-ghost btn-sm" onClick={close}>Ver planes</a>
            </div>
          ) : (
            <ul className="cart-list">
              {cart.map((item) => (
                <li key={item.id} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{symbol}{totals.item(item.priceUsd).toFixed(2)} {currency}</span>
                  </div>
                  <button className="icon-btn icon-btn--sm" onClick={() => removeFromCart(item.id)} aria-label={`Eliminar ${item.name}`}>
                    <Icon name="trash" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="drawer__foot">
          <form onSubmit={submit} className="promo">
            <label className="field__label" htmlFor="promo-code-input">Código Creador / Cupón</label>
            <div className="promo__row">
              <input id="promo-code-input" className="input" placeholder="Ej. ALEDEVV" value={code} onChange={(e) => { setCode(e.target.value); setErr(false) }} />
              <button type="submit" className="btn btn-ghost btn-sm">Aplicar</button>
            </div>
            {err && <p className="field__error">Código inválido o expirado.</p>}
          </form>

          <div className="cart-total">
            <span>Total estimado</span>
            <strong>{symbol}{totals.total.toFixed(2)} {currency}</strong>
          </div>

          <button className="btn btn-primary btn-wide btn-lg" onClick={checkout}>
            Completar pedido vía Discord <Icon name="arrow-right" size={17} />
          </button>
        </div>
      </aside>
    </>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <Icon name={t.type === 'error' ? 'x-circle' : t.type === 'info' ? 'info' : 'check-circle'} size={18} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <a href="./" className="brand"><img src="./assets/img/logo.jpg" alt="" width="32" height="32" /><span>synthetix<em>.host</em></span></a>
          <p>Infraestructura Cloud &amp; Gaming. Aloja tus redes de Minecraft, VPS Cloud y Bots de Discord con rendimiento extremo.</p>
        </div>
        <div>
          <h4>Servicios</h4>
          <a href="#productos">Planes Networks</a>
          <a href="#productos">Minecraft Servers</a>
          <a href="#productos">VPS Cloud</a>
          <a href="#productos">Bots Discord</a>
          <a href="#dominios">Dominios</a>
        </div>
        <div>
          <h4>Cuenta</h4>
          <a href="./login/">Iniciar sesión</a>
          <a href="./register/">Registrarse</a>
          <a href="./dashboard/">Panel de cliente</a>
          <a href={PANEL_URL} target="_blank" rel="noopener">panel.synthetixhost.lol</a>
        </div>
        <div>
          <h4>Soporte</h4>
          <a href="#soporte">Centro de soporte</a>
          <a href={DISCORD_URL} target="_blank" rel="noopener">Soporte Oficial en Discord</a>
          <a href="#faq">Preguntas frecuentes</a>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>&copy; 2026 Synthetix Host. Todos los derechos reservados.</p>
        <span className="status-chip"><span className="dot dot--live" /> Nodos Cloud 100% Operativos</span>
      </div>
    </footer>
  )
}
