// Funciones de Autenticación
async function registerUser(email, password, username) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    showToast('¡Registro exitoso! Revisa tu correo o inicia sesión.');
    sendDiscordWebhook(`🎉 **Nuevo Cliente Registrado:** \`${email}\` (${username})`);
    
    setTimeout(() => window.location.href = 'login.html', 1500);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loginUser(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    localStorage.setItem('user_email', data.user.email);
    showToast('¡Bienvenido de nuevo!');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loginWithDiscord() {
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin + '/dashboard.html'
      }
    });
    if (error) throw error;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function logoutUser() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  localStorage.removeItem('user_email');
  showToast('Has cerrado sesión.');
  setTimeout(() => window.location.href = 'index.html', 800);
}

// Middleware para páginas protegidas
async function checkAuthMiddleware() {
  if (!supabaseClient) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (!session) {
    window.location.href = 'login.html';
  } else {
    localStorage.setItem('user_email', session.user.email);
  }
}

// Notificaciones por Webhook a Discord
async function sendDiscordWebhook(messageText) {
  if (!CONFIG.DISCORD_WEBHOOK_URL || CONFIG.DISCORD_WEBHOOK_URL.includes('tu-webhook')) return;

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
    });
  } catch (e) {
    console.warn("Webhook de Discord no enviado:", e);
  }
}
