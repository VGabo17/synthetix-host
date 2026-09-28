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
  const userBadgeEl = document.getElementById('user-badge');
  const greetingEl = document.getElementById('user-greeting');

  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error || !session) {
      window.location.href = '/login/';
      return;
    }

    const user = session.user;
    const username = user.user_metadata?.username || user.email.split('@')[0];

    if (userBadgeEl) {
      userBadgeEl.textContent = `Cliente: ${user.email}`;
    }

    if (greetingEl) {
      greetingEl.textContent = `Bienvenido, ${username}`;
    }

  } catch (err) {
    console.error('Error al verificar sesión:', err);
    if (userBadgeEl) userBadgeEl.textContent = 'Error de sesión';
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

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      window.location.href = '/login/';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      showToast('No se pudo cerrar sesión.', 'error');
    }
  };

  const logoutDesktop = document.getElementById('logout-btn-desktop');
  if (logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);

  const logoutMobile = document.getElementById('logout-btn-mobile');
  if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);
});
