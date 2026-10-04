import { useRef, useState } from 'react'
import { BILLING_URL, COMPARE, DISCORD_URL, FAQ, PANEL_URL, TAKEN_DOMAINS, TLDS, configPrice } from '../data.js'
import { useStore } from '../store.jsx'
import { Icon } from './Icon.jsx'
import { Reveal } from './Reveal.jsx'

/* ------------------------------ Dominios ------------------------------ */
export function Domains() {
  const { addToCart, toast, symbol } = useStore()
  const [name, setName] = useState('')
  const [tld, setTld] = useState(TLDS[0].tld)
  const [res, setRes] = useState(null)

  const check = (e) => {
    e.preventDefault()
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!clean) { toast('Escribe un nombre de marca para consultar.', 'error'); return }
    const price = TLDS.find((t) => t.tld === tld).price
    setRes({ full: clean + tld, price, taken: TAKEN_DOMAINS.includes(clean) })
  }

  return (
    <section id="dominios" className="section container">
      <Reveal className="domain glass">
        <div className="domain__copy">
          <span className="kicker"><Icon name="globe" size={14} /> Registro de dominios</span>
          <h2>Encuentra tu Dominio Ideal</h2>
          <p>Consulta la disponibilidad y adhiérelo a tu carrito.</p>
        </div>

        <form className="domain__form" onSubmit={check}>
          <div className="domain__bar">
            <Icon name="search" size={18} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Escribe tu marca (ej. nixermc)" aria-label="Nombre de dominio" />
            <select value={tld} onChange={(e) => setTld(e.target.value)} aria-label="Extensión">
              {TLDS.map((t) => <option key={t.tld} value={t.tld}>{t.tld} (${t.price.toFixed(2)}/año)</option>)}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
          </div>

          {res && (
            <div className={`domain__result ${res.taken ? 'is-taken' : 'is-free'}`}>
              <div>
                <strong>{res.full}</strong>
                <span>
                  <Icon name={res.taken ? 'x-circle' : 'check-circle'} size={16} />
                  {res.taken ? 'No disponible' : '¡Disponible!'}
                </span>
              </div>
              {!res.taken && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => addToCart(`Dominio ${res.full} (1 Año)`, res.price)}>
                  <Icon name="plus" size={15} /> Añadir por {symbol === '€' ? '$' : symbol}{res.price.toFixed(2)}
                </button>
              )}
            </div>
          )}
        </form>
      </Reveal>
    </section>
  )
}

/* ------------------------------ Comparativa ------------------------------ */
export function Compare() {
  return (
    <section id="comparativa" className="section container">
      <Reveal className="section__head">
        <span className="kicker">Transparencia total</span>
        <h2>Comparativa Técnica de Arquitecturas</h2>
        <p>Descubre qué nivel de infraestructura requiere tu servidor.</p>
      </Reveal>
      <Reveal className="table-wrap glass">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">Característica</th>
              {COMPARE.cols.map((c, i) => <th scope="col" key={c} className={i === 1 ? 'is-cyan' : i === 2 ? 'is-violet' : ''}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {COMPARE.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row"><Icon name={r.icon} size={16} /> {r.label}</th>
                {r.cells.map((c, i) => (
                  <td key={i} className={`${r.hi === i ? 'is-hi' : ''} ${r.dim?.includes(i) ? 'is-dim' : ''}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  )
}

/* ------------------------------ Latencia ------------------------------ */
async function sample(url) {
  const t = performance.now()
  try {
    await fetch(`${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, { mode: 'no-cors', cache: 'no-store' })
  } catch { return null }
  return performance.now() - t
}

const TARGETS = [
  { key: 'panel', label: 'Panel de control', host: 'panel.synthetixhost.lol', url: PANEL_URL, icon: 'server' },
  { key: 'billing', label: 'Tienda y facturación', host: 've.synthetixhost.lol', url: BILLING_URL, icon: 'card' }
]

export function Latency() {
  const [state, setState] = useState({})
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    setState({})
    for (const t of TARGETS) {
      const vals = []
      for (let i = 0; i < 5; i++) {
        const v = await sample(t.url)
        if (v !== null) vals.push(v)
      }
      // La primera muestra incluye el handshake TLS; la descartamos si hay más.
      const used = vals.length > 1 ? vals.slice(1) : vals
      const result = used.length
        ? { min: Math.round(Math.min(...used)), avg: Math.round(used.reduce((a, b) => a + b, 0) / used.length) }
        : { fail: true }
      setState((s) => ({ ...s, [t.key]: result }))
    }
    setRunning(false)
  }

  const level = (ms) => (ms < 80 ? 'good' : ms < 180 ? 'mid' : 'bad')

  return (
    <section id="pingtest" className="section container">
      <Reveal className="latency glass">
        <div className="latency__top">
          <div>
            <span className="kicker"><Icon name="wifi" size={14} /> Baja latencia</span>
            <h2>Test de Respuesta Global</h2>
            <p>Prueba la velocidad de conexión directa desde tu navegador hacia nuestros servicios.</p>
          </div>
          <button className="btn btn-primary" onClick={run} disabled={running}>
            <Icon name="activity" size={17} /> {running ? 'Midiendo...' : 'Probar latencia'}
          </button>
        </div>

        <div className="latency__grid">
          {TARGETS.map((t) => {
            const r = state[t.key]
            return (
              <div key={t.key} className="lat-card">
                <span className="lat-card__ico"><Icon name={t.icon} size={20} /></span>
                <div className="lat-card__txt">
                  <b>{t.label}</b>
                  <small>{t.host}</small>
                </div>
                <div className={`lat-card__val ${r && !r.fail ? `is-${level(r.avg)}` : ''}`}>
                  {!r ? (running ? <span className="spinner" /> : '-- ms') : r.fail ? 'Sin respuesta' : `${r.avg} ms`}
                </div>
                <div className="lat-bar"><span style={{ width: r && !r.fail ? `${Math.min(100, (r.avg / 300) * 100)}%` : '0%' }} /></div>
                {r && !r.fail && <small className="lat-card__min">Mejor muestra: {r.min} ms</small>}
              </div>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------ Configurador ------------------------------ */
export function Configurator() {
  const { addToCart, price, currency, cycle } = useStore()
  const [ram, setRam] = useState(8)
  const [cpu, setCpu] = useState(4)
  const base = configPrice(ram)
  const pct = (v, min, max) => `${((v - min) / (max - min)) * 100}%`

  return (
    <section id="configurador" className="section container">
      <Reveal className="builder glass">
        <div className="builder__controls">
          <span className="kicker"><Icon name="sliders" size={14} /> A medida</span>
          <h2>Configura tu servidor a medida</h2>
          <p>Ajusta los recursos según las exigencias de tus modalidades.</p>

          <div className="slider">
            <div className="slider__head"><label htmlFor="ram-slider"><Icon name="ram" size={16} /> Memoria RAM Dedicada</label><output>{ram} GB</output></div>
            <input id="ram-slider" type="range" min="8" max="48" step="8" value={ram} style={{ '--p': pct(ram, 8, 48) }} onChange={(e) => setRam(+e.target.value)} />
            <div className="slider__scale"><span>8</span><span>48 GB</span></div>
          </div>

          <div className="slider">
            <div className="slider__head"><label htmlFor="cpu-slider"><Icon name="cpu" size={16} /> vCPU Cores Dedicados</label><output>{cpu} vCPU</output></div>
            <input id="cpu-slider" type="range" min="4" max="12" step="2" value={cpu} style={{ '--p': pct(cpu, 4, 12) }} onChange={(e) => setCpu(+e.target.value)} />
            <div className="slider__scale"><span>4</span><span>12 vCPU</span></div>
          </div>
        </div>

        <div className="builder__summary">
          <div className="rig" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={i < ram / 8 ? 'on' : ''} style={{ '--k': i }} />
            ))}
          </div>
          <span className="eyebrow-label">Estimación calculada</span>
          <div className="builder__price">
            <span>{currency === 'EUR' ? '€' : '$'}</span>
            <strong>{price(base)}</strong>
            <em>{currency}</em>
          </div>
          <small>{cycle === 'annual' ? 'por mes (Plan Anual)' : 'por mes'}</small>
          <button className="btn btn-primary btn-wide btn-lg" onClick={() => addToCart(`Network Custom (${ram} GB RAM, ${cpu} vCPU)`, base)}>
            <Icon name="cart" size={18} /> Añadir configuración
          </button>
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------ Soporte ------------------------------ */
function openChat(toast) {
  const api = window.Tawk_API
  if (api && typeof api.maximize === 'function') {
    try { api.maximize(); return } catch {}
  }
  toast('El chat en vivo aún está cargando. Inténtalo en unos segundos o abre un ticket en Discord.', 'info')
}

function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div className={`faq-item ${open ? 'is-open' : ''}`}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-item__ico"><Icon name={open ? 'minus' : 'plus'} size={16} /></span>
      </button>
      <div className="faq-item__body"><div><p>{a}</p></div></div>
    </div>
  )
}

export function Support() {
  const { toast } = useStore()
  return (
    <section id="soporte" className="section container">
      <Reveal className="section__head">
        <span className="kicker"><Icon name="lifebuoy" size={14} /> Centro de soporte</span>
        <h2>Soporte cuando lo necesitas</h2>
        <p>Elige el canal que prefieras para activar tu servicio o resolver cualquier duda.</p>
      </Reveal>

      <div className="support-grid">
        <Reveal className="support-card glass support-card--discord" delay={0}>
          <span className="support-card__ico"><Icon name="ticket" size={24} /></span>
          <h3>Tickets en Discord</h3>
          <p>Abre un ticket en nuestro Discord para recibir la entrega de tu servicio y atención de la comunidad.</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener" className="btn btn-primary btn-wide"><Icon name="discord" size={17} /> Unirse a Discord</a>
        </Reveal>
        <Reveal className="support-card glass" delay={90}>
          <span className="support-card__ico"><Icon name="chat" size={24} /></span>
          <h3>Chat en vivo</h3>
          <p>Habla con nuestro equipo directamente desde la web, sin salir de esta página.</p>
          <button className="btn btn-ghost btn-solid btn-wide" onClick={() => openChat(toast)}><Icon name="headset" size={17} /> Abrir chat</button>
        </Reveal>
        <Reveal className="support-card glass" delay={180}>
          <span className="support-card__ico"><Icon name="terminal" size={24} /></span>
          <h3>Panel de control</h3>
          <p>Consola en vivo, gestión de archivos y rendimiento en panel.synthetixhost.lol.</p>
          <a href={PANEL_URL} target="_blank" rel="noopener" className="btn btn-ghost btn-solid btn-wide">Abrir panel <Icon name="external" size={16} /></a>
        </Reveal>
      </div>

      <div className="support-lower">
        <Reveal className="steps glass">
          <h3>Así se activa tu servicio</h3>
          <ol>
            <li><span>1</span><div><b>Arma tu carrito</b><p>Elige planes, dominio o configura tu servidor a medida.</p></div></li>
            <li><span>2</span><div><b>Copia tu orden</b><p>Se copia un resumen completo de tu pedido al finalizar.</p></div></li>
            <li><span>3</span><div><b>Abre un ticket</b><p>Pégalo en nuestro Discord y procesamos la entrega en menos de 60 segundos.</p></div></li>
          </ol>
        </Reveal>

        <Reveal id="faq" className="faq" delay={100}>
          <h3>Preguntas Frecuentes</h3>
          {FAQ.map((f, i) => <FaqItem key={f.q} {...f} defaultOpen={i === 0} />)}
        </Reveal>
      </div>
    </section>
  )
}
