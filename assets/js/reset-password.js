import { supabaseClient } from './supabaseClient.js';

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

  setTimeout(() => toast.remove(), 7000);
}

document.addEventListener('DOMContentLoaded', () => {
  const emailForm = document.getElementById('reset-email-form');
  const passwordForm = document.getElementById('new-password-form');

  const hash = new URLSearchParams(window.location.hash.substring(1));
  const type = hash.get('type');

  if (type === 'recovery') {
    if (emailForm) emailForm.style.display = 'none';
    if (passwordForm) passwordForm.style.display = 'block';
  } else {
    if (emailForm) emailForm.style.display = 'block';
    if (passwordForm) passwordForm.style.display = 'none';
  }

  if (emailForm) {
    emailForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('reset-email').value.trim().toLowerCase();
      if (!email) {
        showToast('Escribe tu correo.', 'error');
        return;
      }

      const redirectTo = `${window.location.origin}/login.html`;

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        console.error(error);
        showToast(error.message || 'No se pudo enviar el enlace.', 'error');
        return;
      }

      showToast('Revisa tu correo para restablecer tu contraseña.', 'success');
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const newPassword = document.getElementById('new-password').value;
      if (!newPassword || newPassword.length < 6) {
        showToast('La contraseña nueva debe tener al menos 6 caracteres.', 'error');
        return;
      }

      try {
        const { error } = await supabaseClient.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        showToast('Contraseña actualizada correctamente.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } catch (error) {
        console.error(error);
        showToast(error.message || 'No se pudo cambiar la contraseña.', 'error');
      }
    });
  }
});
