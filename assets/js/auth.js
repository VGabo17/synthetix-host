import { supabaseClient } from './supabaseClient.js'

// Configuración general del sitio
const CONFIG = {
  BRAND_NAME: 'Synthetix Host',
  DISCORD_WEBHOOK_URL: '' // Coloca tu URL de Webhook de Discord aquí si deseas recibir alertas
}

// Sistema auxiliar para mostrar notificaciones flotantes (Toast)
function showToast(message, type = 'success') {
  let root = document.getElementById('toast-root')
  if (!root) {
    root = document.createElement('div')
    root.id = 'toast-root'
    document.body.appendChild(root)
  }

  // Estilo del contenedor principal del toast (Fijo arriba a la derecha)
  root.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
    max-width: 90vw;
  `

  const toast = document.createElement('div')
  toast.style.cssText = `
    background: ${type === 'error' ? '#ef4444' : '#10b981'};
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: auto;
    font-family: system-ui, -apple-system, sans-serif;
    word-break: break-word;
  `
  toast.textContent = message
  root.appendChild(toast)

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  })

  // Animación de salida y remoción (los errores duran un poco más para leerse bien)
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(-10px)'
    setTimeout(() => toast.remove(), 300)
  }, type === 'error' ? 6000 : 3500)
}

// --- Funciones de Autenticación ---

export async function registerUser(email, password, username) {
  try {
    if (!supabaseClient) throw new Error("Cliente de Supabase no inicializado.")

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })

    if (error) throw error

    showToast('¡Cuenta creada con éxito! Redirigiendo...', 'success')
    sendDiscordWebhook(`🎉 **Nuevo Cliente Registrado:** \`${email}\` (${username})`)
    
    if (data?.session?.user?.email) {
      localStorage.setItem('user_email', data.session.user.email)
    }

    setTimeout(() => {
      window.location.href = 'dashboard.html'
    }, 1500)

  } catch (err) {
    console.error("Error en Registro:", err)
    showToast("ERROR REGISTRO: " + (err.message || 'Desconocido'), 'error')
  }
}

export async function loginUser(email, password) {
  try {
    if (!supabaseClient) throw new Error("Cliente de Supabase no inicializado.")

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    if (data?.user?.email) {
      localStorage.setItem('user_email', data.user.email)
    }

    showToast('¡Bienvenido de nuevo!')
    setTimeout(() => {
      window.location.href = 'dashboard.html'
    }, 1000)

  } catch (err) {
    console.error("Error en Login:", err)
    // Esto mostrará el error exacto flotando en tu celular
    showToast("ERROR LOGIN: " + (err.message || 'Credenciales inválidas'), 'error')
  }
}

export async function loginWithDiscord() {
  try {
    if (!supabaseClient) throw new Error("Cliente de Supabase no inicializado.")

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/dashboard.html`
      }
    })
    
    if (error) throw error

  } catch (err) {
    console.error("Error en Discord OAuth:", err)
    showToast("ERROR DISCORD: " + (err.message || 'Desconocido'), 'error')
  }
}

export async function logoutUser() {
  try {
    if (supabaseClient) {
      await supabaseClient.auth.signOut()
    }
  } catch (err) {
    console.warn("Error durante signout:", err)
  } finally {
    localStorage.removeItem('user_email')
    showToast('Has cerrado sesión.')
    setTimeout(() => {
      window.location.href = 'index.html'
    }, 800)
  }
}

// Middleware para páginas protegidas (dashboard, panel, etc.)
export async function checkAuthMiddleware() {
  if (!supabaseClient) return

  const { data: { session } } = await supabaseClient.auth.getSession()

  if (!session) {
    window.location.href = 'login.html'
  } else if (session.user?.email) {
    localStorage.setItem('user_email', session.user.email)
  }
}

// Notificaciones por Webhook a Discord
async function sendDiscordWebhook(messageText) {
  if (!CONFIG.DISCORD_WEBHOOK_URL || CONFIG.DISCORD_WEBHOOK_URL.trim() === '') return

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
    console.warn("Webhook de Discord não enviado:", e)
  }
}

// --- Vinculación Automática con el DOM ---
document.addEventListener('DOMContentLoaded', () => {

  // 1. Captura Formulario de Login
  const loginForm = document.getElementById('login-form')
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const email = document.getElementById('email')?.value?.trim()
      const password = document.getElementById('password')?.value
      if (email && password) {
        loginUser(email, password)
      } else {
        showToast('Por favor completa todos los campos.', 'error')
      }
    })
  }

  // 2. Captura Formulario de Registro
  const registerForm = document.getElementById('register-form')
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const email = document.getElementById('email')?.value?.trim()
      const password = document.getElementById('password')?.value
      const usernameInput = document.getElementById('username')?.value?.trim()
      const username = usernameInput || (email ? email.split('@')[0] : 'usuario')

      if (email && password) {
        registerUser(email, password, username)
      } else {
        showToast('Por favor completa todos los campos.', 'error')
      }
    })
  }

  // 3. Captura Botón de Discord
  const discordBtn = document.getElementById('discord-login')
  if (discordBtn) {
    discordBtn.addEventListener('click', (e) => {
      e.preventDefault()
      loginWithDiscord()
    })
  }

  // 4. Captura Botón de Cierre de Sesión
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault()
      logoutUser()
    })
  }

  // 5. Verificación de página protegida
  if (document.body.getAttribute('data-page') === 'dashboard') {
    checkAuthMiddleware()
  }
})
