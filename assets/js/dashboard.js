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
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    window.location.href = 'login.html';
    return;
  }

  const userEmailEl = document.getElementById('user-badge');
  if (userEmailEl) {
    userEmailEl.textContent = `Cliente: ${session.user.email}`;
  }

  const greeting = document.getElementById('user-greeting');
  const username = session.user.user_metadata?.username || session.user.email.split('@')[0];
  if (greeting) {
    greeting.textContent = `Bienvenido, ${username}`;
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

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error: logoutError } = await supabaseClient.auth.signOut();

      if (logoutError) {
        console.error(logoutError);
        showToast('No se pudo cerrar sesión.', 'error');
        return;
      }

      window.location.href = 'login.html';
    });
  }
});
