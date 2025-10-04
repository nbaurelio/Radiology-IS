// Supabase Configuration
// Save this file as: shared/supabase-config.js

const SUPABASE_URL = 'https://sazosfxthfouurqjyyhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhem9zZnh0aGZvdXVycWp5eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTg3NDcsImV4cCI6MjA3NTEzNDc0N30.XnHbXw1yo_I1c7W4_9J5SaC_7Qp821tfq_LkvgClTc8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to check if user is logged in
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper function to sign out
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = '../Login/login.html';
    }
    return error;
}

// Export for use in other files
window.supabaseClient = supabase;
window.getCurrentUser = getCurrentUser;
window.signOut = signOut;