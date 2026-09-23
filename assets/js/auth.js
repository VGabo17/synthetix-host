import { supabaseClient } from './supabaseClient.js'

const CONFIG = {
  BRAND_NAME: 'Synthetix Host',
  DISCORD_WEBHOOK_URL: '' 
}

// --- Autenticación y Manejo de Sesión ---

export async function registerUser(email, password, username) {
  try {
    if (!supabaseClient) throw new Error("Cliente de Supabase no inicializado.")

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })

    if (error) throw error

    alert('¡Cuenta creada con éxito!')
    sendDiscordWebhook(`🎉 **Nuevo Cliente Registrado:** \`${email}\` (${username})`)
    
    if (data?.session?.user?.email) {
      localStorage.setItem('user_email', data.session.user.email)
    }

    window.location.href = 'dashboard.html'
  } catch (err) {
    console.error("Error en Registro:", err)
    alert("ERROR REGISTRO: " + (err.message || JSON.stringify(err)))
  }
}

export async function loginUser(email, password) {
  try {
    if (!supabaseClient) throw new Error("Cliente de Supabase no inicializado.")

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })

    if (error) throw error

    if (data?.user?.email) {
      localStorage.setItem('user_email', data.user.email)
    }

    alert('¡Bienvenido de nuevo!')
    window.location.href = 'dashboard.html'
  } catch (err) {
    console.error("Error en Login:", err)
    alert("ERROR LOGIN: " + (err.message || JSON.stringify(err)))
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
    alert("ERROR DISCORD: " + (err.message || JSON.stringify(err)))
  }
}

export async function logoutUser() {
  try {
    if (supabaseClient) await supabaseClient.auth.signOut()
  } catch (err) {
    console.warn("Error durante signout:", err)
  } finally {
    localStorage.removeItem('user_email')
    alert('Has cerrado sesión.')
    window.location.href = 'index.html'
  }
}

// Middleware para páginas protegidas y captura de OAuth de Discord
export async function checkAuthMiddleware() {
  if (!supabaseClient) return

  // Supabase procesa automáticamente los tokens del hash de la URL al iniciar sesión con OAuth
  const { data: { session }, error } = await supabaseClient.auth.getSession()

  if (error || !session) {
    // Si estamos en el dashboard y no hay sesión, regresamos al login
    if (window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'login.html'
    }
  } else if (session.user?.email) {
    localStorage.setItem('user_email', session.user.email)
    // Si estamos en la página de login/registro pero ya hay sesión, mandamos al dashboard
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
      window.location.href = 'dashboard.html'
    }
  }
}

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
    console.warn("Webhook de Discord no enviado:", e)
  }
}

// --- Control del Menú Hamburguesa y Formularios ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar verificación de sesión y tokens OAuth
  checkAuthMiddleware()

  // 2. Control robusto del Menú Hamburguesa (Drawer)
  const drawer = document.getElementById('drawer')
  const overlay = document.getElementById('drawerOverlay')
  const openBtn = document.getElementById('openDrawer')
  const closeBtn = document.getElementById('closeDrawer')

  if (openBtn && drawer && overlay) {
    openBtn.addEventListener('click', () => {
      drawer.classList.add('open')
      overlay.classList.add('open')
    })
  }

  const cerrarMenu = () => {
    if (drawer) drawer.classList.remove('open')
    if (overlay) overlay.classList.remove('open')
  }

  if (closeBtn) closeBtn.addEventListener('click', cerrarMenu)
  if (overlay) overlay.addEventListener('click', cerrarMenu)

  // Cerrar menú al hacer clic en enlaces internos si existen
  ['inicioLink', 'catalogoLink', 'inicioLinkMobile', 'catalogoLinkMobile'].forEach(id => {
    const link = document.getElementById(id)
    if (link) link.addEventListener('click', cerrarMenu)
  })

  // 3. Captura Formulario de Login
  const loginForm = document.getElementById('login-form')
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const email = document.getElementById('email')?.value?.trim()
      const password = document.getElementById('password')?.value
      if (email && password) {
        loginUser(email, password)
      } else {
        alert('Por favor completa todos los campos.')
      }
    })
  }

  // 4. Captura Formulario de Registro
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
        alert('Por favor completa todos los campos.')
      }
    })
  }

  // 5. Botón de Discord OAuth
  const discordBtn = document.getElementById('discord-login')
  if (discordBtn) {
    discordBtn.addEventListener('click', (e) => {
      e.preventDefault()
      loginWithDiscord()
    })
  }

  // 6. Botón de Cierre de Sesión
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault()
      logoutUser()
    })
  }
})
