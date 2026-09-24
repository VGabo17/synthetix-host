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

document.addEventListener('DOMContentLoaded', async () => {
  const emailForm = document.getElementById('reset-email-form')
  const passwordForm = document.getElementById('new-password-form')

  // Detección robusta: revisa tanto en los parámetros normales (?) como en el hash (#)
  const queryParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))

  const isRecovery = 
    queryParams.get('type') === 'recovery' || 
    hashParams.get('type') === 'recovery' || 
    queryParams.has('token_hash')

  if (isRecovery) {
    if (emailForm) {
      emailForm.style.display = 'none'
    }

    if (passwordForm) {
      passwordForm.style.display = 'block'
    }
  } else {
    if (emailForm) {
      emailForm.style.display = 'block'
    }

    if (passwordForm) {
      passwordForm.style.display = 'none'
    }
  }

  // 1. Enviar correo de recuperación
  if (emailForm) {
    emailForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const emailInput = document.getElementById('reset-email')
      const submitButton = emailForm.querySelector(
        'button[type="submit"]'
      )

      const email = emailInput.value.trim().toLowerCase()

      if (!email) {
        showToast('Escribe tu correo electrónico.', 'error')
        return
      }

      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Enviando...'
      }

      try {
        const redirectTo =
          `${window.location.origin}/reset-password.html`

        const { error } =
          await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo
          })

        if (error) {
          throw error
        }

        showToast(
          'Correo enviado. Revisa tu bandeja de entrada y spam.',
          'success'
        )
      } catch (error) {
        console.error('Error al enviar recuperación:', error)

        showToast(
          error.message || 'No se pudo enviar el enlace.',
          'error'
        )
      } finally {
        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent = 'Enviar enlace'
        }
      }
    })
  }

  // 2. Guardar nueva contraseña
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const passwordInput =
        document.getElementById('new-password')

      const submitButton = passwordForm.querySelector(
        'button[type="submit"]'
      )

      const newPassword = passwordInput.value

      if (!newPassword || newPassword.length < 6) {
        showToast(
          'La contraseña debe tener al menos 6 caracteres.',
          'error'
        )
        return
      }

      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Guardando...'
      }

      try {
        const { error } =
          await supabaseClient.auth.updateUser({
            password: newPassword
          })

        if (error) {
          throw error
        }

        showToast(
          'Contraseña actualizada correctamente.',
          'success'
        )

        setTimeout(() => {
          window.location.href = 'login.html'
        }, 1800)
      } catch (error) {
        console.error('Error al actualizar contraseña:', error)

        showToast(
          error.message || 'No se pudo cambiar la contraseña.',
          'error'
        )

        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent = 'Guardar contraseña'
        }
      }
    })
  }
})
