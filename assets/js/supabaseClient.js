import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = "https://pnnnhkbriqizjmkhodbu.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubm5oa2JyaXFpempta2hvZGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjU3MzEsImV4cCI6MjEwNTc0MTczMX0.IlDYR2qUoXAHggBm_Sy7lPVgNOVxxXLhzQltTaXwAHE"

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

if (supabaseClient) {
  console.log('✅ Supabase inicializado correctamente con la nueva base de datos.');
} else {
  console.error('❌ Error al inicializar Supabase.');
}
