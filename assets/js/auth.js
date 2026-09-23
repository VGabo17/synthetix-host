import { supabaseClient } from './supabaseClient.js'

// Configuración general del sitio
const CONFIG = {
  BRAND_NAME: 'Synthetix Host',
  DISCORD_WEBHOOK_URL: '' // Coloca tu URL de Webhook de Discord aquí si deseas recibir alertas
}

// Sistema auxiliar para mostrar notificaciones (Toast)
function showToast(message, type = 'success') {
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
    transition: opacity 0.3s ease;
  `
  toast.textContent = message
  root.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// --- Funciones de Autenticación ---

export async function registerUser(email, password, username) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })

    if (error) throw error

    showToast('¡Registro exitoso! Revisa tu correo o inicia sesión.')
    sendDiscordWebhook(`🎉 **Nuevo Cliente Registrado:** \`${email}\` (${username})`)

    setTimeout(() => window.location.href = 'login.html', 1500)
  } catch (err) {
    showToast(err.message, 'error')
  }
}

export async function loginUser(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    localStorage.setItem('user_email', data.user.email)
    showToast('¡Bienvenido de nuevo!')
    setTimeout(() => window.location.href = 'dashboard.html', 1000)
  } catch (err) {
    showToast(err.message, 'error')
  }
}

export async function loginWithDiscord() {
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/dashboard.html`
      }
    })
    if (error) throw error
  } catch (err) {
    showToast(err.message, 'error')
  }
}

export async function logoutUser() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut()
  }
  localStorage.removeItem('user_email')
  showToast('Has cerrado sesión.')
  setTimeout(() => window.location.href = 'index.html', 800)
}

// Middleware para páginas protegidas (panel/dashboard)
export async function checkAuthMiddleware() {
  if (!supabaseClient) return

  const { data: { session } } = await supabaseClient.auth.getSession()

  if (!session) {
    window.location.href = 'login.html'
  } else {
    localStorage.setItem('user_email', session.user.email)
  }
}

// Notificaciones por Webhook a Discord
async function sendDiscordWebhook(messageText) {
  if (!CONFIG.DISCORD_WEBHOOK_URL || CONFIG.DISCORD_WEBHOOK_URL.includes('tu-webhook')) return

  try {
    await fetch(CONFIG.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "🔔 Alerta de Sistema - " + CONFIG.BRAND_NAME,
          description: messageText,
          color: 0xA855F7,
          timestamp: new Date().toISOString()
        }]
      })
    })
  } catch (e) {
    console.warn("Webhook de Discord no enviado:", e)
  }
}

// --- Vinculación Automática con el DOM ---
document.addEventListener('DOMContentLoaded', () => {
  // Formulario de Login
  const loginForm = document.getElementById('login-form')
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      loginUser(email, password)
    })
  }

  // Formulario de Registro
  const registerForm = document.getElementById('register-form')
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      const username = document.getElementById('username')?.value || email.split('@')[0]
      registerUser(email, password, username)
    })
  }

  // Botón de Discord
  const discordBtn = document.getElementById('discord-login')
  if (discordBtn) {
    discordBtn.addEventListener('click', () => {
      loginWithDiscord()
    })
  }

  // Botón de Cierre de Sesión
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault()
      logoutUser()
    })
  }

  // Si la página requiere protección (por ejemplo, dashboard.html)
  if (document.body.getAttribute('data-page') === 'dashboard') {
    checkAuthMiddleware()
  }
})
