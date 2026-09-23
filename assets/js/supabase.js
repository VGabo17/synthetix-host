// Inicialización del Cliente Supabase
let supabaseClient = null;

if (typeof supabase !== 'undefined' && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
  supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  console.log('✅ Supabase inicializado correctamente.');
} else {
  console.error('❌ Error: El SDK de Supabase o las credenciales no están cargadas.');
}
