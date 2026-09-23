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

        submitButton.disabled = false
        submitButton.textContent = 'Registrarse →'
      } catch (error) {
        console.error('Error real de registro:', error)
        showToast(
          `No se pudo registrar: ${error.message || 'error desconocido'}`,
          'error'
        )

        submitButton.disabled = false
        submitButton.textContent = 'Registrarse →'
      }
    })
  }
})