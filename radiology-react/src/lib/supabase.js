import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ztzdihfljvbnnmwaphho.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0emRpaGZsanZibm5td2FwaGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTk4MjksImV4cCI6MjA5NzI3NTgyOX0.I1fYCdBNOwmmCITsSRziVLnLNVRGIjEdDMtLvH3x2g0'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0emRpaGZsanZibm5td2FwaGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5OTgyOSwiZXhwIjoyMDk3Mjc1ODI5fQ.r-dOFIYsvrIFi6nASv_RMMjvN65eUfwfTDpxuIxChIY'

// Regular client for normal operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: {
      apikey: SUPABASE_ANON_KEY
    }
  }
})

// Admin client for user management (bypasses email verification)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY
    }
  }
})