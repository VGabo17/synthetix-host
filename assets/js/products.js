// Datos del Catálogo de Productos
const PRODUCTS_DATA = {
  minecraft_budget: [
    { id: "mc-b1", name: "Budget 2GB", ram: "2 GB DDR4", cpu: "1 vCPU (Xeon/Ryzen)", disk: "20 GB SSD", price: "2.50", paymenter_id: "mc-budget-2g" },
    { id: "mc-b2", name: "Budget 4GB", ram: "4 GB DDR4", cpu: "2 vCPU (Xeon/Ryzen)", disk: "40 GB SSD", price: "4.99", paymenter_id: "mc-budget-4g", popular: true },
    { id: "mc-b3", name: "Budget 8GB", ram: "8 GB DDR4", cpu: "3 vCPU (Xeon/Ryzen)", disk: "60 GB SSD", price: "8.99", paymenter_id: "mc-budget-8g" }
  ],
  minecraft_premium: [
    { id: "mc-p1", name: "Extreme 8GB", ram: "8 GB DDR5", cpu: "2 vCPU (Ryzen 9 7950X)", disk: "80 GB NVMe PCIe 4.0", price: "12.99", paymenter_id: "mc-prem-8g" },
    { id: "mc-p2", name: "Extreme 16GB", ram: "16 GB DDR5", cpu: "4 vCPU (Ryzen 9 7950X)", disk: "120 GB NVMe PCIe 4.0", price: "22.99", paymenter_id: "mc-prem-16g", popular: true },
    { id: "mc-p3", name: "Extreme 32GB", ram: "32 GB DDR5", cpu: "6 vCPU (Ryzen 9 7950X)", disk: "200 GB NVMe PCIe 4.0", price: "42.99", paymenter_id: "mc-prem-32g" }
  ],
  bots_discord: [
    { id: "bot-d1", name: "Bot Node.js / Python", ram: "1 GB RAM", cpu: "1 vCPU", disk: "10 GB NVMe", price: "1.50", paymenter_id: "bot-dc-1" },
    { id: "bot-d2", name: "Bot Java Heavy", ram: "3 GB RAM", cpu: "2 vCPU", disk: "20 GB NVMe", price: "3.50", paymenter_id: "bot-dc-2", popular: true }
  ],
  bots_telegram: [
    { id: "bot-t1", name: "Telegram Lite", ram: "512 MB RAM", cpu: "0.5 vCPU", disk: "5 GB NVMe", price: "0.99", paymenter_id: "bot-tg-1" },
    { id: "bot-t2", name: "Telegram Business", ram: "2 GB RAM", cpu: "1 vCPU", disk: "15 GB NVMe", price: "2.50", paymenter_id: "bot-tg-2" }
  ]
};

// Renderizar Tarjetas de Productos por Categoría
function renderProductsCategory(categoryKey) {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const products = PRODUCTS_DATA[categoryKey] || [];
  const userEmail = localStorage.getItem('user_email') || '';

  container.innerHTML = products.map(p => {
    const checkoutUrl = `${CONFIG.PAYMENTER_URL}/store/checkout/${p.paymenter_id}${userEmail ? '?email=' + encodeURIComponent(userEmail) : ''}`;

    return `
      <div class="relative bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border ${p.popular ? 'border-purple-500/80 shadow-xl shadow-purple-500/10' : 'border-slate-800'} flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300">
        ${p.popular ? '<span class="absolute -top-3 right-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">Más Popular</span>' : ''}
        
        <div>
          <h3 class="text-xl font-bold text-white mb-2">${p.name}</h3>
          <div class="my-4 flex items-baseline gap-1">
            <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">${CONFIG.CURRENCY}${p.price}</span>
            <span class="text-xs text-slate-400">/ mes</span>
          </div>

          <ul class="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4 mb-6">
            <li class="flex items-center gap-2"><span class="text-blue-400">⚡</span> ${p.ram}</li>
            <li class="flex items-center gap-2"><span class="text-purple-400">⚙️</span> ${p.cpu}</li>
            <li class="flex items-center gap-2"><span class="text-blue-400">💾</span> ${p.disk}</li>
            <li class="flex items-center gap-2"><span class="text-purple-400">🛡️</span> Anti-DDoS Avanzado</li>
          </ul>
        </div>

        <button onclick="handleCheckoutRedirect('${checkoutUrl}')" class="w-full py-3 rounded-xl font-bold text-xs transition-all shadow-lg ${p.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'}">
          Contratar Ahora
        </button>
      </div>
    `;
  }).join('');
}

function handleCheckoutRedirect(url) {
  const userEmail = localStorage.getItem('user_email');
  if (!userEmail) {
    showToast('Por favor, inicia sesión antes de contratar un plan.', 'error');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }
  window.open(url, '_blank');
}

// Calculadora Interactiva de Planes Personalizados
function initCustomCalculator() {
  const ramInput = document.getElementById('calc-ram');
  const cpuInput = document.getElementById('calc-cpu');
  const diskInput = document.getElementById('calc-disk');

  if (!ramInput) return;

  function recalculate() {
    const ram = parseInt(ramInput.value);
    const cpu = parseInt(cpuInput.value);
    const disk = parseInt(diskInput.value);

    document.getElementById('val-ram').textContent = `${ram} GB DDR5`;
    document.getElementById('val-cpu').textContent = `${cpu} vCPU`;
    document.getElementById('val-disk').textContent = `${disk} GB NVMe`;

    // Tarifa base $1.00 + $1.50/GB RAM + $1.50/vCPU + $0.05/GB Disco
    const price = (1.00 + (ram * 1.50) + (cpu * 1.50) + (disk * 0.05)).toFixed(2);
    document.getElementById('calc-total-price').textContent = `${CONFIG.CURRENCY}${price}`;

    const userEmail = localStorage.getItem('user_email') || '';
    const btn = document.getElementById('calc-checkout-btn');
    const checkoutUrl = `${CONFIG.PAYMENTER_URL}/store/checkout/custom-plan?ram=${ram}&cpu=${cpu}&disk=${disk}${userEmail ? '&email=' + encodeURIComponent(userEmail) : ''}`;
    
    btn.onclick = () => handleCheckoutRedirect(checkoutUrl);
  }

  [ramInput, cpuInput, diskInput].forEach(inp => inp.addEventListener('input', recalculate));
  recalculate();
}
