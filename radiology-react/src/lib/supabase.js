import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sazosfxthfouurqjyyhh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhem9zZnh0aGZvdXVycWp5eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTg3NDcsImV4cCI6MjA3NTEzNDc0N30.XnHbXw1yo_I1c7W4_9J5SaC_7Qp821tfq_LkvgClTc8'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhem9zZnh0aGZvdXVycWp5eWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1ODc0NywiZXhwIjoyMDc1MTM0NzQ3fQ.uLnkuon75ayXnbdmo-KdBOZvYqQy_-EBqKamdT_R1j4'

// Regular client for normal operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin client for user management (bypasses email verification)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})