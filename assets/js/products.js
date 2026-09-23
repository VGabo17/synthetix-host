import { supabaseClient } from './supabaseClient.js'

// --- Configuración General ---
const CONFIG = {
  CURRENCY: '€',
  PAYMENTER_URL: 'https://billing.synthetix.host' // Cambia esto por la URL de tu Paymenter
}

// --- Datos Locales de Respaldo (Fallback) ---
const PRODUCTS_DATA = {
  budget: [
    { id: "mc-b1", name: "Budget 2GB", ram: "2 GB DDR4", cpu: "1 vCPU (Xeon/Ryzen)", disk: "20 GB SSD", price: "2.50", paymenter_id: "mc-budget-2g" },
    { id: "mc-b2", name: "Budget 4GB", ram: "4 GB DDR4", cpu: "2 vCPU (Xeon/Ryzen)", disk: "40 GB SSD", price: "4.99", paymenter_id: "mc-budget-4g", popular: true },
    { id: "mc-b3", name: "Budget 8GB", ram: "8 GB DDR4", cpu: "3 vCPU (Xeon/Ryzen)", disk: "60 GB SSD", price: "8.99", paymenter_id: "mc-budget-8g" }
  ],
  premium: [
    { id: "mc-p1", name: "Extreme 8GB", ram: "8 GB DDR5", cpu: "2 vCPU (Ryzen 9 7950X)", disk: "80 GB NVMe PCIe 4.0", price: "12.99", paymenter_id: "mc-prem-8g" },
    { id: "mc-p2", name: "Extreme 16GB", ram: "16 GB DDR5", cpu: "4 vCPU (Ryzen 9 7950X)", disk: "120 GB NVMe PCIe 4.0", price: "22.99", paymenter_id: "mc-prem-16g", popular: true },
    { id: "mc-p3", name: "Extreme 32GB", ram: "32 GB DDR5", cpu: "6 vCPU (Ryzen 9 7950X)", disk: "200 GB NVMe PCIe 4.0", price: "42.99", paymenter_id: "mc-prem-32g" }
  ],
  discord: [
    { id: "bot-d1", name: "Bot Node.js / Python", ram: "1 GB RAM", cpu: "1 vCPU", disk: "10 GB NVMe", price: "1.50", paymenter_id: "bot-dc-1" },
    { id: "bot-d2", name: "Bot Java Heavy", ram: "3 GB RAM", cpu: "2 vCPU", disk: "20 GB NVMe", price: "3.50", paymenter_id: "bot-dc-2", popular: true }
  ],
  telegram: [
    { id: "bot-t1", name: "Telegram Lite", ram: "512 MB RAM", cpu: "0.5 vCPU", disk: "5 GB NVMe", price: "0.99", paymenter_id: "bot-tg-1" },
    { id: "bot-t2", name: "Telegram Business", ram: "2 GB RAM", cpu: "1 vCPU", disk: "15 GB NVMe", price: "2.50", paymenter_id: "bot-tg-2" }
  ]
}

// --- Notificación Auxiliar ---
function showToast(message, type = 'info') {
  const root = document.getElementById('toast-root') || document.body
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.style.cssText = `
    background: ${type === 'error' ? '#ef4444' : '#a855f7'};
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 0.9rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  `
  toast.textContent = message
  root.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

// --- Redirección al Checkout ---
function handleCheckoutRedirect(url) {
  const userEmail = localStorage.getItem('user_email')
  if (!userEmail) {
    showToast('Por favor, inicia sesión antes de contratar un plan.', 'error')
    setTimeout(() => window.location.href = 'login.html', 1500)
    return
  }
  window.open(url, '_blank')
}

// --- Renderizado de Productos desde Supabase / Local ---
async function renderProductsCategory(categoryKey) {
  const container = document.getElementById('product-grid') || document.getElementById('products-grid')
  if (!container) return

  container.innerHTML = '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center;">Cargando planes...</p>'

  let products = []

  // Intenta consultar la tabla Plan de Supabase
  try {
    const { data: dbPlans, error } = await supabaseClient
      .from('Plan')
      .select('*')
      .eq('category', categoryKey)

    if (!error && dbPlans && dbPlans.length > 0) {
      products = dbPlans
    } else {
      // Mapea claves para compatibilidad con el fallback
      const keyMap = { 'budget': 'budget', 'premium': 'premium', 'discord': 'discord', 'telegram': 'telegram' }
      products = PRODUCTS_DATA[keyMap[categoryKey] || categoryKey] || []
    }
  } catch (err) {
    products = PRODUCTS_DATA[categoryKey] || []
  }

  if (products.length === 0) {
    container.innerHTML = '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center;">No hay planes disponibles en esta categoría.</p>'
    return
  }

  const userEmail = localStorage.getItem('user_email') || ''

  container.innerHTML = products.map(p => {
    const paymentId = p.paymenter_id || p.id
    const checkoutUrl = `${CONFIG.PAYMENTER_URL}/store/checkout/${paymentId}${userEmail ? '?email=' + encodeURIComponent(userEmail) : ''}`
    const isPopular = p.popular || false

    return `
      <div class="server-card glass" style="position: relative; display: flex; flex-direction: column; justify-content: space-between;">
        ${isPopular ? '<span style="position: absolute; top: -12px; right: 20px; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #fff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px;">Más Popular</span>' : ''}
        
        <div>
          <div class="server-head">
            <span>✦</span> ${p.name}
          </div>
          <div class="price">
            <sup>${CONFIG.CURRENCY}</sup><strong>${p.price}</strong><small>/mes</small>
          </div>

          <div class="estimate-list">
            <span>⚡ ${p.ram || 'RAM Dedicada'}</span>
            <span>⚙️ ${p.cpu || 'vCPU de alto rendimiento'}</span>
            <span>💾 ${p.disk || 'NVMe Gen4'}</span>
            <span>🛡️ Anti-DDoS Avanzado</span>
          </div>
        </div>

        <button class="btn btn-primary btn-wide checkout-btn" data-url="${checkoutUrl}">
          Contratar Ahora
        </button>
      </div>
    `
  }).join('')

  // Evento para botones de compra
  container.querySelectorAll('.checkout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleCheckoutRedirect(btn.getAttribute('data-url'))
    })
  })
}

// --- Calculadora de Plan Personalizado ---
function initCustomCalculator() {
  const ramInput = document.getElementById('ram') || document.getElementById('calc-ram')
  const cpuInput = document.getElementById('cpu') || document.getElementById('calc-cpu')
  const diskInput = document.getElementById('disk') || document.getElementById('calc-disk')

  if (!ramInput) return

  function recalculate() {
    const ram = parseInt(ramInput.value) || 2
    const cpu = parseInt(cpuInput.value) || 1
    const disk = parseInt(diskInput.value) || 20

    // Actualiza textos dinámicos
    const ramVal = document.getElementById('ram-value') || document.getElementById('val-ram')
    const cpuVal = document.getElementById('cpu-value') || document.getElementById('val-cpu')
    const diskVal = document.getElementById('disk-value') || document.getElementById('val-disk')

    if (ramVal) ramVal.textContent = `${ram} GB`
    if (cpuVal) cpuVal.textContent = `${cpu} cores`
    if (diskVal) diskVal.textContent = `${disk} GB`

    // Fórmula: €1.00 base + €1.50 por GB RAM + €1.50 por vCPU + €0.05 por GB Disco
    const price = (1.00 + (ram * 1.50) + (cpu * 1.50) + (disk * 0.05)).toFixed(2)

    const priceElem = document.getElementById('custom-price') || document.getElementById('calc-total-price')
    if (priceElem) priceElem.textContent = price

    const userEmail = localStorage.getItem('user_email') || ''
    const checkoutUrl = `${CONFIG.PAYMENTER_URL}/store/checkout/custom-plan?ram=${ram}&cpu=${cpu}&disk=${disk}${userEmail ? '&email=' + encodeURIComponent(userEmail) : ''}`

    const btn = document.querySelector('[data-plan="custom"]') || document.getElementById('calc-checkout-btn')
    if (btn) {
      btn.onclick = () => handleCheckoutRedirect(checkoutUrl)
    }
  }

  [ramInput, cpuInput, diskInput].forEach(inp => {
    if (inp) inp.addEventListener('input', recalculate)
  })

  recalculate()
}

// --- Inicialización al Cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab')

  // Carga inicial (categoría 'budget')
  renderProductsCategory('budget')
  initCustomCalculator()

  // Control de pestañas
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      const category = tab.getAttribute('data-category')
      renderProductsCategory(category)
    })
  })
})
