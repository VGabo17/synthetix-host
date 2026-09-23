import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://pnnnhkbriqizjmkhodbu.supabase.co'
const SUPABASE_ANON_KEY = 'Sb_publishable_6mgwm2JwyzzveWGAGCXyJQ_NjF1Mxrx'

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

if (supabaseClient) {
  console.log('✅ Supabase inicializado correctamente.');
} else {
  console.error('❌ Error al inicializar Supabase.');
}
