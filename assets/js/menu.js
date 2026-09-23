// Sistema de Notificaciones Toast (Diseño Lila/Azul)
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const isError = type === 'error';
  
  toast.className = `pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-5 opacity-0 text-sm font-medium ${
    isError 
      ? 'bg-slate-900/90 border-red-500/50 text-red-300 shadow-red-500/10' 
      : 'bg-slate-900/90 border-indigo-500/40 text-slate-100 shadow-indigo-500/20'
  }`;

  toast.innerHTML = `
    <span class="${isError ? 'text-red-400' : 'text-purple-400'}">
      ${isError ? '🚫' : '✨'}
    </span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-5', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Lógica del Menú Móvil y Estado de la Navbar
document.addEventListener('DOMContentLoaded', async () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Renderizar estado de autenticación en la Navbar
  updateNavbarState();
});

async function updateNavbarState() {
  const authNav = document.getElementById('auth-nav-items');
  const mobileAuthNav = document.getElementById('mobile-auth-nav');
  
  if (!authNav || !supabaseClient) return;

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    const userEmail = session.user.email;
    const userInitial = userEmail.charAt(0).toUpperCase();

    const userHtml = `
      <a href="dashboard.html" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all font-medium text-sm">
        <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">${userInitial}</span>
        <span>Dashboard</span>
      </a>
      <button onclick="logoutUser()" class="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 text-sm font-medium transition-all">
        Salir
      </button>
    `;

    authNav.innerHTML = userHtml;
    if (mobileAuthNav) mobileAuthNav.innerHTML = userHtml;
  } else {
    const guestHtml = `
      <a href="login.html" class="px-4 py-2 rounded-xl border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-sm font-semibold transition-all">
        Iniciar Sesión
      </a>
      <a href="register.html" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
        Registrarse
      </a>
    `;

    authNav.innerHTML = guestHtml;
    if (mobileAuthNav) mobileAuthNav.innerHTML = guestHtml;
  }
}
