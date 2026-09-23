import { supabaseClient } from './supabaseClient.js'

function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root')

  const toast = document.createElement('div')

  toast.className =
    type === 'success'
      ? 'p-4 mb-4 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
      : 'p-4 mb-4 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400'

  toast.style.whiteSpace = 'pre-wrap'
  toast.textContent = message

  if (root) {
    root.replaceChildren(toast)
  } else {
    alert(message)
  }

  setTimeout(() => {
    toast.remove()
  }, 10000)
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form')

  if (!registerForm) {
    showToast('No se encontró el formulario de registro.', 'error')
    return
  }

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const usernameInput = document.getElementById('username')
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')
    const submitButton = document.getElementById('submit-btn')

    const username = usernameInput.value.trim()
    const email = emailInput.value.trim().toLowerCase()
    const password = passwordInput.value

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
      /*
       * Para GitHub Pages, window.location.origin no incluye
       * /synthetix-host. Por eso usamos la ruta actual.
       */
      const loginUrl = new URL(
        'login.html',
        window.location.href
      ).href

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

      console.log('Respuesta completa de Supabase:', result)

      const { data, error } = result

      if (error) {
        throw error
      }

      if (!data || !data.user) {
        throw new Error(
          'Supabase no devolvió ningún usuario. Revisa que estés usando el proyecto correcto.'
        )
      }

      const mensaje = data.session
        ? 'Usuario creado correctamente.'
        : 'Usuario creado. Revisa tu correo y la carpeta de spam para confirmarlo.'

      showToast(mensaje, 'success')

      /*
       * No redirigimos inmediatamente para que puedas leer el mensaje.
       */
      submitButton.disabled = false
      submitButton.textContent = 'Registrarse →'
    } catch (error) {
      console.error('Error real de Supabase:', error)

      const detalles = [
        'No se pudo registrar el usuario.',
        `Mensaje: ${error.message || 'sin mensaje'}`,
        `Código: ${error.status || error.code || 'sin código'}`
      ].join('\n')

      showToast(detalles, 'error')

      submitButton.disabled = false
      submitButton.textContent = 'Registrarse →'
    }
  })
})