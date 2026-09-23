import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.8/dist/supabase.min.js'

const SUPABASE_URL = "https://pnnnhkbriqizjmkhodbu.supabase.co"
const SUPABASE_ANON_KEY = "COPIA_LA_KEY_EXACTA_DE_TU_PROJECT_SUPABASE"

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})