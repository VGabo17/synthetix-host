// Catálogo y constantes. Precios y planes idénticos a la web original (USD).
export const DISCORD_URL = 'https://discord.gg/QDZ5ff5Shb'
export const PANEL_URL = 'https://panel.synthetixhost.lol'
export const BILLING_URL = 'https://ve.synthetixhost.lol/'
export const SERVER_IP = 'mc.synthetixhost.lol'

export const EXCHANGE_RATE = 0.92
export const ANNUAL_MULTIPLIER = 0.8
export const PROMO_CODES = { ALEDEVV: 0.15, NIXER: 0.1, VIP: 0.2 }

export const REGIONS = [
  { value: 'US', label: 'US East (Virginia)' },
  { value: 'EU', label: 'EU Central (Frankfurt)' },
  { value: 'SA', label: 'SA East (São Paulo)' }
]

export const CATEGORIES = [
  { key: 'networks', label: 'Planes Networks', short: 'Networks', icon: 'network' },
  { key: 'juegos', label: 'Minecraft Servers', short: 'Minecraft', icon: 'gamepad' },
  { key: 'vps', label: 'VPS Cloud', short: 'VPS Cloud', icon: 'cloud' },
  { key: 'discord', label: 'Bots Discord', short: 'Bots Discord', icon: 'bot' }
]

const ram = (b, t) => ({ icon: 'ram', b, t })
const cpu = (b, t) => ({ icon: 'cpu', b, t })
const disk = (b, t) => ({ icon: 'disk', b, t })
const feat = (t, icon = 'check') => ({ icon, b: '', t })

export const PLANS = {
  networks: [
    {
      id: 'net-starter', name: 'Network Starter', cartName: 'Network Starter', badge: '6 GB RAM', price: 9.99,
      desc: 'Ideal para iniciar tu red con rendimiento real.',
      features: [ram('6 GB', 'RAM Dedicada'), cpu('2 vCPU', 'Cores AMD EPYC'), disk('70 GB', 'SSD NVMe Gen4'), feat('Proxy (Velocity) + BoxPvP'), feat('Anti-DDoS Capa 7 Incluido', 'shield')]
    },
    {
      id: 'net-pro', name: 'Network Pro', cartName: 'Network Pro', badge: '9 GB RAM', price: 14.99,
      desc: 'El equilibrio perfecto para comunidades en crecimiento.',
      features: [ram('9 GB', 'RAM Dedicada'), cpu('3 vCPU', 'Cores AMD EPYC'), disk('120 GB', 'SSD NVMe Gen4'), feat('Proxy + Lobby + BoxPvP'), feat('Anti-DDoS Capa 7 Incluido', 'shield')]
    },
    {
      id: 'net-mega', name: 'Mega Network', cartName: 'Mega Network', highlight: 'MÁS POPULAR', price: 19.99,
      desc: 'Potencia bruta para redes grandes con mundos masivos.',
      features: [ram('14 GB', 'RAM (Repartida)'), cpu('4 vCPU', 'Cores AMD EPYC'), disk('180 GB', 'SSD NVMe Gen4'), feat('Proxy + Lobby + Survival'), feat('Anti-DDoS Capa 7 Incluido', 'shield')]
    },
    {
      id: 'net-ultra', name: 'Ultra Network', cartName: 'Ultra Network (24GB)', badge: '24 GB RAM', price: 29.99,
      desc: 'Máximo rendimiento para redes enormes sin límites.',
      features: [ram('24 GB', 'RAM Dedicada'), cpu('6 vCPU', 'Cores AMD EPYC'), disk('300 GB', 'SSD NVMe Gen4'), feat('Proxy + Múltiples Lobbies'), feat('Todas las modalidades ilimitadas'), feat('Anti-DDoS Capa 7 Avanzado', 'shield')]
    }
  ],
  juegos: [
    {
      id: 'mc-starter', name: 'Starter', cartName: 'Minecraft Starter (2GB)', badge: '2 GB RAM', price: 2.5,
      desc: 'Para jugar con amigos cercanos.',
      features: [ram('2 GB', 'RAM DDR4'), cpu('1 vCPU Core', 'dedicado'), disk('25 GB', 'SSD NVMe'), feat('Slots Ilimitados')]
    },
    {
      id: 'mc-pro', name: 'Pro Server', cartName: 'Minecraft Pro (4GB)', highlight: 'POPULAR', price: 4.99,
      desc: 'Para servidores públicos y comunidades.',
      features: [ram('4 GB', 'RAM DDR4'), cpu('2 vCPU Cores', 'dedicados'), disk('50 GB', 'SSD NVMe'), feat('Base MySQL Incluida', 'database')]
    },
    {
      id: 'mc-master', name: 'Master Server', cartName: 'Minecraft Master (8GB)', badge: '8 GB RAM', price: 9.99,
      desc: 'Para modpacks pesados y alta concurrencia.',
      features: [ram('8 GB', 'RAM DDR4'), cpu('3 vCPU Cores', 'dedicados'), disk('100 GB', 'SSD NVMe'), feat('Backups Automáticos')]
    },
    {
      id: 'mc-titan', name: 'Titan Server', cartName: 'Minecraft Titan (12GB)', badge: '12 GB RAM', price: 14.99,
      desc: 'Alto rendimiento para servidores grandes y modpacks exigentes.',
      features: [ram('12 GB', 'RAM DDR4 / DDR5'), cpu('4 vCPU Cores', 'dedicados'), disk('150 GB', 'SSD NVMe'), feat('Backups Automáticos frecuentes'), feat('Prioridad de procesamiento en el nodo', 'activity')]
    }
  ],
  vps: [
    {
      id: 'vps-basic', name: 'VPS Basic', cartName: 'VPS Basic', badge: '2 GB RAM', price: 3.99,
      features: [ram('2 GB', 'RAM Dedicada'), cpu('1 vCPU Core', 'KVM'), disk('30 GB', 'NVMe Gen4'), feat('Acceso Root SSH', 'terminal')]
    },
    {
      id: 'vps-4', name: 'Cloud VPS 4', cartName: 'Cloud VPS 4', highlight: 'RECOMENDADO', price: 10.99,
      features: [ram('8 GB', 'RAM Dedicada'), cpu('4 vCPU Cores', 'KVM'), disk('100 GB', 'NVMe Gen4'), feat('Acceso Root + IP Dedicada', 'terminal')]
    }
  ],
  discord: [
    {
      id: 'bot-1', name: 'Bot #1 (Iniciación)', cartName: 'Plan Bot #1 (Iniciación)', badge: '512 MB', price: 1.5,
      features: [ram('512 MB', 'RAM Dedicada'), cpu('50% CPU', 'Dedicado'), disk('5 GB', 'SSD NVMe'), feat('Uptime 24/7', 'activity')]
    },
    {
      id: 'bot-2', name: 'Bot #2 (Crecimiento)', cartName: 'Plan Bot #2 (Crecimiento)', highlight: 'POPULAR', price: 3.0,
      features: [ram('1 GB', 'RAM Dedicada'), cpu('100% CPU', 'Dedicado'), disk('10 GB', 'SSD NVMe'), feat('Uptime 24/7', 'activity')]
    }
  ]
}

export const TLDS = [
  { tld: '.lol', price: 1.99 },
  { tld: '.store', price: 2.5 },
  { tld: '.com', price: 11.99 },
  { tld: '.net', price: 13.5 },
  { tld: '.gg', price: 19.99 }
]
export const TAKEN_DOMAINS = ['nixermc', 'google', 'minecraft', 'synthetix', 'play', 'store', 'shop', 'survival', 'pvp', 'aledevv']

export const COMPARE = {
  cols: ['Minecraft Standalone', 'Network Velocity', 'Cloud VPS KVM'],
  rows: [
    { label: 'Procesador', icon: 'cpu', cells: ['AMD EPYC (Compartido)', 'AMD EPYC 100% Dedicado', 'vCPU KVM Virtualizado'], hi: 1 },
    { label: 'Almacenamiento', icon: 'disk', cells: ['25 GB - 150 GB NVMe', '70 GB - 300 GB NVMe Gen4', '30 GB - 200 GB NVMe Gen4'] },
    { label: 'Bases MySQL', icon: 'database', cells: ['1 Incluida', 'Ilimitadas', 'Instalables (Root)'], hi: 1 },
    { label: 'Acceso SSH', icon: 'terminal', cells: ['No (Solo SFTP)', 'No (SFTP Multiserver)', 'Sí (Consola Root)'], hi: 2, dim: [0, 1] },
    { label: 'Anti-DDoS', icon: 'shield', cells: ['Capa 4 / 7 Estándar', 'Capa 7 Game Shield Pro', 'Capa 4 Estándar'], hi: 1 }
  ]
}

export const FAQ = [
  {
    q: '¿Cómo se realiza la activación de un servicio?',
    a: 'Al generar tu orden en el carrito, se copia un resumen completo. Abres un ticket en nuestro Discord y procesamos la entrega en menos de 60 segundos.'
  },
  {
    q: '¿Puedo escalar mi plan más adelante?',
    a: 'Sí, puedes hacer upgrades de RAM o vCPU en cualquier momento sin perder ningún archivo ni la IP de tu servidor.'
  }
]

// Precio del configurador a medida (idéntico a la lógica original: depende de la RAM)
export function configPrice(ram) {
  if (ram >= 48) return 59.99
  if (ram >= 24) return 32.99
  if (ram >= 16) return 21.99
  return 19.99
}
