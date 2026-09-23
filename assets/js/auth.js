import { supabaseClient } from './supabaseClient.js';

// Función auxiliar para mostrar notificaciones (Toast)
function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = `p-4 mb-4 rounded-xl text-xs font-semibold shadow-lg transition-all ${
    type === 'success' 
      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
      : 'bg-red-500/10 border border-red-500/30 text-red-400'
  }`;
  toast.textContent = message;
  
  root.innerHTML = '';
  root.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Manejo del Registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = document.getElementById('submit-btn');

      if (!username || !email || !password) {
        showToast('Por favor completa todos los campos.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';
      }

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              username: username
            }
          }
        });

        if (error) throw error;

        showToast('¡Cuenta creada con éxito! Revisa tu correo si se requiere verificación.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);

      } catch (err) {
        console.error('Error en registro:', err.message);
        showToast(err.message || 'Error al registrar la cuenta.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Registrarse →';
        }
      }
    });
  }

  // 2. Manejo del Login por Correo/Contraseña
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Introduce tu correo y contraseña.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';
      }

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        showToast('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html'; // O cambia a tu panel/dashboard
        }, 1200);

      } catch (err) {
        console.error('Error en login:', err.message);
        showToast(err.message || 'Credenciales incorrectas.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Iniciar sesión →';
        }
      }
    });
  }

  // 3. Manejo del Login con Discord (OAuth)
  const discordBtn = document.getElementById('discord-login');
  if (discordBtn) {
    discordBtn.addEventListener('click', async () => {
      try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: window.location.origin + '/index.html'
          }
        });

        if (error) throw error;
      } catch (err) {
        console.error('Error con Discord OAuth:', err.message);
        showToast('No se pudo conectar con Discord: ' + err.message, 'error');
      }
    });
  }
});
