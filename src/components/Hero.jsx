import { useEffect, useRef, useState } from 'react'
import { DISCORD_URL, SERVER_IP } from '../data.js'
import { useCountUp, useTilt } from '../hooks.js'
import { useStore } from '../store.jsx'
import { Icon } from './Icon.jsx'

export function Hero() {
  const { toast } = useStore()
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const tiltRef = useTilt(5)
  const uptime = useCountUp(99.98, true, 1600, 2)

  useEffect(() => {
    let stop = () => {}
    let alive = true
    import('../globe.js').then((m) => {
      if (alive && canvasRef.current) stop = m.mountGlobe(canvasRef.current)
    })
    return () => { alive = false; stop() }
  }, [])

  const copyIp = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP)
      setCopied(true)
      toast(`IP ${SERVER_IP} copiada.`)
      setTimeout(() => setCopied(false), 1800)
    } catch { toast('No se pudo copiar la IP.', 'error') }
  }

  return (
    <section className="hero container">
      <div className="hero__copy">
        <span className="eyebrow"><span className="pulse" /> Infraestructura Cloud &amp; Gaming &bull; AMD EPYC&trade;</span>
        <h1>
          Tu servidor online.<br />
          <em>Sin lag y al mejor precio.</em>
        </h1>
        <p className="hero__lead">
          Aloja tus redes de Minecraft, servidores dedicados, VPS Cloud o Bots de Discord con rendimiento extremo y panel de control intuitivo en <b>panel.synthetixhost.lol</b>.
        </p>

        <div className="ip-copier">
          <span className="ip-copier__label"><Icon name="gamepad" size={16} /> IP Servidor</span>
          <code>{SERVER_IP}</code>
          <button className="btn btn-primary btn-sm" onClick={copyIp}>
            <Icon name={copied ? 'check' : 'copy'} size={15} /> {copied ? 'Copiada' : 'Copiar'}
          </button>
        </div>

        <div className="hero__actions">
          <a href="#productos" className="btn btn-primary btn-lg">Ver planes <Icon name="arrow-right" size={18} /></a>
          <a href={DISCORD_URL} target="_blank" rel="noopener" className="btn btn-ghost btn-lg"><Icon name="discord" size={18} /> Unirse a Discord</a>
        </div>

        <ul className="trust-row">
          <li><span className="dot dot--live" /> Estado Global: Nodos Cloud 100% Operativos</li>
          <li><Icon name="zap" size={15} /> Uptime: 99.98%</li>
          <li><Icon name="clock" size={15} /> Activación Inmediata En 60 Segundos</li>
        </ul>
      </div>

      <div className="hero__stage">
        <canvas ref={canvasRef} className="globe" aria-label="Globo 3D con las regiones de Synthetix: Virginia, Frankfurt y São Paulo" role="img" />
        <div ref={tiltRef} className="node-card tilt glass">
          <div className="node-card__head">
            <span>Estado de nodos en tiempo real</span>
            <span className="badge badge--live"><span className="dot dot--live" /> 100% operativo</span>
          </div>
          <div className="node-card__grid">
            <div><b>{uptime}%</b><small>Uptime</small></div>
            <div><b>NVMe Gen4</b><small>RAID Rápido</small></div>
            <div><b>DDoS L7</b><small>Mitigación</small></div>
          </div>
        </div>
      </div>
    </section>
  )
}
