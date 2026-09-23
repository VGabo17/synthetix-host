import { supabaseClient } from './supabaseClient.js'

function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root')

  if (!root) {
    alert(message)
    return
  }

  const toast = document.createElement('div')

  toast.className =
    type === 'success'
      ? 'p-4 mb-4 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
      : 'p-4 mb-4 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400'

  toast.textContent = message
  root.replaceChildren(toast)

  setTimeout(() => {
    toast.remove()
  }, 5000)
}

function getSupabaseError(error) {
  if (!error) return 'Ocurrió un error desconocido.'

  const msg = String(error.message || '').toLowerCase()

  if (msg.includes('user already registered')) {
    return 'Este correo ya está registrado.'
  }

  if (msg.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }

  if (msg.includes('email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.'
  }

  if (msg.includes('failed to fetch')) {
    return 'No se pudo conectar con Supabase. Revisa la URL y la clave.'
  }

  return error.message || 'No se pudo completar la operación.'
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form')

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const username = document.getElementById('username').value.trim()
      const email = document.getElementById('email').value.trim().toLowerCase()
      const password = document.getElementById('password').value
      const submitButton = document.getElementById('submit-btn')

      if (!username || !email || !password) {
        showToast('Completa todos los campos.', 'error')
        return
      }

      if (password.length < 6) {
        showToast('La contraseña debe tener mínimo 6 caracteres.', 'error')
        return
      }

      submitButton.disabled = true
      submitButton.textContent = 'Registrando...'

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        })

        if (error) throw error

        if (data.user && !data.session) {
          showToast(
            'Registro correcto. Revisa tu correo para confirmar la cuenta.',
            'success'
          )
        } else {
          showToast('Cuenta creada correctamente.', 'success')
        }

        setTimeout(() => {
          window.location.href = 'login.html'
        }, 2000)
      } catch (error) {
        console.error('Error de registro:', error)
        showToast(getSupabaseError(error), 'error')

        submitButton.disabled = false
        submitButton.textContent = 'Registrarse →'
      }
    })
  }

  const loginForm = document.getElementById('login-form')

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const email = document.getElementById('email').value.trim().toLowerCase()
      const password = document.getElementById('password').value
      const submitButton = loginForm.querySelector('button[type="submit"]')

      if (!email || !password) {
        showToast('Introduce tu correo y contraseña.', 'error')
        return
      }

      submitButton.disabled = true
      submitButton.textContent = 'Iniciando sesión...'

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        showToast('Inicio de sesión correcto.', 'success')

        setTimeout(() => {
          window.location.href = 'dashboard.html'
        }, 1000)
      } catch (error) {
        console.error('Error de inicio de sesión:', error)
        showToast(getSupabaseError(error), 'error')

        submitButton.disabled = false
        submitButton.textContent = 'Iniciar sesión →'
      }
    })
  }

  const discordBtn = document.getElementById('discord-login')

  if (discordBtn) {
    discordBtn.addEventListener('click', async () => {
      try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: window.location.origin + '/index.html'
          }
        })

        if (error) throw error
      } catch (error) {
        console.error('Error con Discord OAuth:', error)
        showToast('No se pudo conectar con Discord.', 'error')
      }
    })
  }
})