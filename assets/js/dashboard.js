import { supabaseClient } from './supabaseClient.js';
import CONFIG from './config.js';

function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root');
  if (!root) {
    alert(message);
    return;
  }

  const toast = document.createElement('div');
  toast.className = type === 'success'
    ? 'p-4 mb-4 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
    : 'p-4 mb-4 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400';
  toast.textContent = message;
  root.replaceChildren(toast);

  setTimeout(() => toast.remove(), 5000);
}

document.addEventListener('DOMContentLoaded', async () => {
  const userEmailEl = document.getElementById('user-badge');

  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    // Si no hay sesión, redirige de forma limpia a /login/
    if (error || !session) {
      window.location.href = '/login/';
      return;
    }

    if (userEmailEl) {
      userEmailEl.textContent = `Cliente: ${session.user.email}`;
    }

    const greeting = document.getElementById('user-greeting');
    const username = session.user.user_metadata?.username || session.user.email.split('@')[0];
    if (greeting) {
      greeting.textContent = `Bienvenido, ${username}`;
    }

  } catch (err) {
    console.error('Error al verificar la sesión:', err);
    if (userEmailEl) {
      userEmailEl.textContent = 'Error al cargar';
    }
    showToast('No se pudo verificar la sesión del usuario.', 'error');
  }

  const pterodactylBtn = document.getElementById('btn-pterodactyl');
  if (pterodactylBtn) {
    pterodactylBtn.addEventListener('click', () => {
      window.open(CONFIG.PTERODACTYL_URL, '_blank');
    });
  }

  const paymenterBtn = document.getElementById('btn-paymenter');
  if (paymenterBtn) {
    paymenterBtn.addEventListener('click', () => {
      window.open(CONFIG.PAYMENTER_URL, '_blank');
    });
  }

  // Función unificada para cerrar sesión (tanto en Escritorio como en Móvil)
  const handleLogout = async () => {
    try {
      const { error: logoutError } = await supabaseClient.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      window.location.href = '/login/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showToast('No se pudo cerrar sesión.', 'error');
    }
  };

  const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
  if (logoutBtnDesktop) {
    logoutBtnDesktop.addEventListener('click', handleLogout);
  }

  const logoutBtnMobile = document.getElementById('logout-btn-mobile');
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', handleLogout);
  }
});
