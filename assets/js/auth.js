import { supabaseClient } from './supabaseClient.js'

const notify = (message, type = 'success') => {
  if (window.synthetixToast) window.synthetixToast(message, type)
  else alert(message)
}

function setLoading(button, loading, label) {
  if (!button) return
  const text = button.querySelector('.btn-label')
  button.disabled = loading
  if (text) text.textContent = label
}

// Indicador de fuerza de contraseña (solo visual)
function initStrength() {
  const input = document.getElementById('password')
  const meter = document.getElementById('strength')
  const label = document.getElementById('strength-label')
  if (!input || !meter || !label || !document.getElementById('register-form')) return
  const names = ['Mínimo 6 caracteres', 'Débil', 'Aceptable', 'Buena', 'Excelente']
  input.addEventListener('input', () => {
    const v = input.value
    let score = 0
    if (v.length >= 6) score++
    if (v.length >= 10) score++
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++
    if (!v) score = 0
    meter.dataset.level = String(score)
    label.textContent = names[score]
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form')
  const loginForm = document.getElementById('login-form')
  initStrength()

  // 1. Registro
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const username = document.getElementById('username').value.trim()
      const email = document.getElementById('email').value.trim().toLowerCase()
      const password = document.getElementById('password').value
      const submitButton = document.getElementById('submit-btn')

      if (!username || !email || !password) {
        notify('Completa todos los campos.', 'error')
        return
      }
      if (password.length < 6) {
        notify('La contraseña debe tener mínimo 6 caracteres.', 'error')
        return
      }

      setLoading(submitButton, true, 'Registrando...')

      try {
        const loginUrl = 'https://ve.synthetixhost.lol/login/'
        const result = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { username }, emailRedirectTo: loginUrl }
        })

        const { data, error } = result
        if (error) throw error
        if (!data || !data.user) throw new Error('Supabase no creó el usuario.')

        notify('Usuario creado. Revisa tu correo y también la carpeta de spam para confirmar la cuenta.', 'success')
      } catch (error) {
        console.error('Error real de registro:', error)
        notify(`No se pudo registrar: ${error.message || 'error desconocido'}`, 'error')
      } finally {
        setLoading(submitButton, false, 'Registrarse')
      }
    })
  }

  // 2. Inicio de sesión
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const email = document.getElementById('email').value.trim().toLowerCase()
      const password = document.getElementById('password').value
      const submitButton = document.getElementById('submit-btn')

      if (!email || !password) {
        notify('Completa todos los campos.', 'error')
        return
      }

      setLoading(submitButton, true, 'Iniciando sesión...')

      try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
        if (error) throw error

        notify('¡Inicio de sesión exitoso! Redirigiendo...', 'success')
        setTimeout(() => { window.location.href = '/dashboard/' }, 1200)
      } catch (error) {
        console.error('Error de login:', error)
        notify(error.message || 'Correo o contraseña incorrectos.', 'error')
        setLoading(submitButton, false, 'Iniciar sesión')
      }
    })

    // 3. Acceso con Discord (OAuth de Supabase)
    const discordBtn = document.getElementById('discord-login')
    if (discordBtn) {
      discordBtn.addEventListener('click', async () => {
        try {
          const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: `${window.location.origin}/dashboard/` }
          })
          if (error) throw error
        } catch (error) {
          console.error('Error con Discord:', error)
          notify(error.message || 'No se pudo iniciar sesión con Discord.', 'error')
        }
      })
    }
  }
})
