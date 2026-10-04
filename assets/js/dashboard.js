import { supabaseClient } from './supabaseClient.js'
import CONFIG from './config.js'

const notify = (message, type = 'success') => {
  if (window.synthetixToast) window.synthetixToast(message, type)
  else alert(message)
}

document.addEventListener('DOMContentLoaded', async () => {
  const userBadgeEl = document.getElementById('user-badge')
  const greetingEl = document.getElementById('user-greeting')

  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession()

    if (error || !session) {
      window.location.href = '/login/'
      return
    }

    const user = session.user
    const username = user.user_metadata?.username || user.email.split('@')[0]

    if (userBadgeEl) {
      userBadgeEl.innerHTML = '<span class="dot dot--live" style="background:var(--cyan)"></span><span></span>'
      userBadgeEl.lastElementChild.textContent = `Cliente: ${user.email}`
    }
    if (greetingEl) greetingEl.textContent = `Bienvenido, ${username}`
  } catch (err) {
    console.error('Error al verificar sesión:', err)
    if (userBadgeEl) userBadgeEl.textContent = 'Error de sesión'
  }

  document.getElementById('btn-pterodactyl')?.addEventListener('click', () => {
    window.open(CONFIG.PTERODACTYL_URL, '_blank', 'noopener')
  })

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut()
      window.location.href = '/login/'
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      notify('No se pudo cerrar sesión.', 'error')
    }
  }

  document.getElementById('logout-btn-desktop')?.addEventListener('click', handleLogout)
  document.getElementById('logout-btn-mobile')?.addEventListener('click', handleLogout)
})
