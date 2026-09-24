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
  }, 7000)
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form')
  const loginForm = document.getElementById('login-form')

  // 1. Lámate a tu lógica original de registro intacta
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

      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Registrando...'
      }

      try {
        const loginUrl = 'https://hosting.nixermc.lol/login.html'

        const result = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            },
            emailRedirectTo: loginUrl
          }
        })

        console.log('Resultado de signUp:', result)

        const { data, error } = result

        if (error) throw error

        if (!data || !data.user) {
          throw new Error('Supabase no creó el usuario.')
        }

        showToast(
          'Usuario creado. Revisa tu correo y también la carpeta de spam para confirmar la cuenta.',
          'success'
        )

      } catch (error) {
        console.error('Error real de registro:', error)
        showToast(
          `No se pudo registrar: ${error.message || 'error desconocido'}`,
          'error'
        )
      } finally {
        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent = 'Registrarse →'
        }
      }
    })
  }

  // 2. Lógica de inicio de sesión con redirección al dashboard
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const emailInput = document.getElementById('email')
      const passwordInput = document.getElementById('password')
      const submitButton = loginForm.querySelector('button[type="submit"]') || document.getElementById('submit-btn')

      const email = emailInput.value.trim().toLowerCase()
      const password = passwordInput.value

      if (!email || !password) {
        showToast('Completa todos los campos.', 'error')
        return
      }

      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Iniciando sesión...'
      }

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        showToast('¡Inicio de sesión exitoso! Redirigiendo...', 'success')

        setTimeout(() => {
          window.location.href = 'dashboard.html'
        }, 1200)

      } catch (error) {
        console.error('Error de login:', error)
        showToast(
          error.message || 'Correo o contraseña incorrectos.',
          'error'
        )
      } finally {
        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent = 'Iniciar Sesión'
        }
      }
    })
  }
})
