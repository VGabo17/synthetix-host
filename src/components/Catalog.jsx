import { CATEGORIES, PLANS, REGIONS } from '../data.js'
import { useTilt } from '../hooks.js'
import { useStore } from '../store.jsx'
import { Icon } from './Icon.jsx'
import { Reveal } from './Reveal.jsx'

function PlanCard({ plan, index }) {
  const { addToCart, price, symbol, currency, cycle } = useStore()
  const ref = useTilt(6)
  const hot = Boolean(plan.highlight)
  return (
    <article ref={ref} className={`plan tilt glass ${hot ? 'plan--hot' : ''}`} style={{ '--i': index }}>
      <span className="plan__glow" aria-hidden="true" />
      <header className="plan__head">
        {hot ? <span className="tag tag--hot">{plan.highlight}</span> : <span className="tag">{plan.badge}</span>}
        <h3>{plan.name}</h3>
        {plan.desc && <p>{plan.desc}</p>}
      </header>

      <div className="plan__price">
        {cycle === 'annual' && <s>{symbol}{(plan.price * (currency === 'EUR' ? 0.92 : 1)).toFixed(2)}</s>}
        <span className="plan__cur">{symbol}</span>
        <strong>{price(plan.price)}</strong>
        <span className="plan__per">{currency} /mes</span>
      </div>

      <ul className="plan__features">
        {plan.features.map((f, i) => (
          <li key={i}>
            <span className="plan__ico"><Icon name={f.icon} size={15} /></span>
            <span>{f.b && <b>{f.b}</b>} {f.t}</span>
          </li>
        ))}
      </ul>

      <button className={`btn btn-wide ${hot ? 'btn-primary' : 'btn-ghost btn-solid'}`} onClick={() => addToCart(plan.cartName, plan.price)}>
        <Icon name="cart" size={17} /> Comprar plan
      </button>
    </article>
  )
}

export function Catalog({ category, setCategory }) {
  const { cycle, setCycle, region, setRegion } = useStore()
  const plans = PLANS[category]
  return (
    <section id="productos" className="section container">
      <Reveal className="section__head">
        <span className="kicker">Catálogo</span>
        <h2>Catálogos y Planes</h2>
        <p>Infraestructura de alto rendimiento optimizada para gaming.</p>
      </Reveal>

      <Reveal className="catalog-controls">
        <div className="segmented" data-active={cycle} role="group" aria-label="Ciclo de facturación">
          <span className="segmented__thumb" aria-hidden="true" />
          <button className={cycle === 'monthly' ? 'is-on' : ''} onClick={() => setCycle('monthly')}>Facturación Mensual</button>
          <button className={cycle === 'annual' ? 'is-on' : ''} onClick={() => setCycle('annual')}>Facturación Anual <em>-20% OFF</em></button>
        </div>
        <label className="select-pill">
          <Icon name="pin" size={15} />
          <span className="select-pill__label">Ubicación del Nodo</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Ubicación del nodo">
            {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Icon name="chevron-down" size={14} />
        </label>
      </Reveal>

      <Reveal className="cat-tabs" role="tablist" aria-label="Categorías de planes">
        {CATEGORIES.map((c) => (
          <button
            key={c.key} role="tab" aria-selected={category === c.key}
            className={`cat-tab ${category === c.key ? 'is-on' : ''}`} onClick={() => setCategory(c.key)}
          >
            <span className="cat-tab__ico"><Icon name={c.icon} size={22} /></span>
            <span className="cat-tab__txt"><b>{c.label}</b><small>{PLANS[c.key].length} planes</small></span>
          </button>
        ))}
      </Reveal>

      <div className="plans" key={category}>
        {plans.map((p, i) => <PlanCard key={p.id} plan={p} index={i} />)}
      </div>
    </section>
  )
}
