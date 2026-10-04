import { supabaseClient } from './supabaseClient.js'

function showToast(message, type = 'success') {
  if (window.synthetixToast) window.synthetixToast(message, type)
  else alert(message)
}

function setLabel(button, text) {
  const label = button && button.querySelector('.btn-label')
  if (label) label.textContent = text
}

document.addEventListener('DOMContentLoaded', async () => {
  const emailForm = document.getElementById('reset-email-form')
  const passwordForm = document.getElementById('new-password-form')

  const queryParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))

  // Detección robusta del parámetro 'code' o 'token_hash' que envía Supabase por correo
  const hasCode = queryParams.has('code')
  const hasTokenHash = queryParams.has('token_hash')
  const isRecoveryType = queryParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery'

  let isRecovery = hasCode || hasTokenHash || isRecoveryType

  // Escuchar eventos de sesión de Supabase
  supabaseClient.auth.onAuthStateChange(async (event) => {
    if (event === 'PASSWORD_RECOVERY') {
      isRecovery = true
      if (emailForm) emailForm.style.display = 'none'
      if (passwordForm) passwordForm.style.display = 'flex'
    }
  })

  if (isRecovery) {
    if (emailForm) emailForm.style.display = 'none'
    if (passwordForm) passwordForm.style.display = 'flex'
  } else {
    if (emailForm) emailForm.style.display = 'flex'
    if (passwordForm) passwordForm.style.display = 'none'
  }

  // 1. Enviar correo de recuperación
  if (emailForm) {
    emailForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const emailInput = document.getElementById('reset-email')
      const submitButton = emailForm.querySelector('button[type="submit"]')
      const email = emailInput.value.trim().toLowerCase()

      if (!email) {
        showToast('Escribe tu correo electrónico.', 'error')
        return
      }

      if (submitButton) {
        submitButton.disabled = true
        setLabel(submitButton, 'Enviando...')
      }

      try {
        const redirectTo = `${window.location.origin}/reset-password/`

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo
        })

        if (error) throw error

        showToast('Correo enviado. Revisa tu bandeja de entrada y spam.', 'success')
      } catch (error) {
        console.error('Error al enviar recuperación:', error)
        showToast(error.message || 'No se pudo enviar el enlace.', 'error')
      } finally {
        if (submitButton) {
          submitButton.disabled = false
          setLabel(submitButton, 'Enviar enlace')
        }
      }
    })
  }

  // 2. Guardar nueva contraseña
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const passwordInput = document.getElementById('new-password')
      const submitButton = passwordForm.querySelector('button[type="submit"]')
      const newPassword = passwordInput.value

      if (!newPassword || newPassword.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres.', 'error')
        return
      }

      if (submitButton) {
        submitButton.disabled = true
        setLabel(submitButton, 'Guardando...')
      }

      try {
        const { error } = await supabaseClient.auth.updateUser({
          password: newPassword
        })

        if (error) throw error

        showToast('Contraseña actualizada correctamente.', 'success')

        setTimeout(() => {
          window.location.href = '/login/'
        }, 1800)
      } catch (error) {
        console.error('Error al actualizar contraseña:', error)
        showToast(error.message || 'No se pudo cambiar la contraseña.', 'error')
        if (submitButton) {
          submitButton.disabled = false
          setLabel(submitButton, 'Guardar contraseña')
        }
      }
    })
  }
})
