# NixerHost - Plataforma Web de Hosting Estática

Sitio web estático listo para producción con diseño gamer (Lila + Azul), autenticación de usuarios mediante Supabase y pasarela de contratación vinculada a Paymenter.

## 🚀 Despliegue en GitHub Pages

1. Sube este código a tu repositorio de GitHub en la rama `main`.
2. Ve a **Settings > Pages** en tu repositorio.
3. En **Source**, selecciona **GitHub Actions**.
4. Cada `git push` desplegará el sitio automáticamente.

## ⚙️ Configuración Inicial

1. **Configurar Credenciales:**
   Abre `assets/js/config.js` y coloca tus URLs reales:
   - `SUPABASE_URL` y `SUPABASE_ANON_KEY`
   - `PAYMENTER_URL`
   - `PTERODACTYL_URL`
   - `DISCORD_WEBHOOK_URL`

2. **Base de Datos Supabase:**
   Copia el contenido del archivo `schema.sql` y ejecútalo en el **SQL Editor** de tu consola de Supabase.

3. **CORS en Paymenter:**
   Asegúrate de permitir las peticiones provenientes del dominio de tu GitHub Pages en tu servidor de Paymenter.
