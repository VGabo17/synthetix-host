
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://pnnnhkbriqizjmkhodbu.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6mgwm2JwyzzveWGAGCXyJQ_NjF1Mxrx'

export const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

console.log('Supabase listo', supabaseClient)