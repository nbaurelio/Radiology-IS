// Dashboard with real data loading

(async function() {
    // Check if user is logged in
    const user = await getCurrentUser();
    
    if (!user) {
        window.location.href = '../Login/login.html';
        return;
    }
    
    // Update welcome message
    const welcomePill = document.querySelector('.pill');
    if (welcomePill && user.email) {
        welcomePill.textContent = `Welcome back, ${user.email.split('@')[0]}`;
    }
    
    // Change Login button to Logout button
    const loginBtn = document.querySelector('.btn-login-nav');
    if (loginBtn) {
        loginBtn.textContent = 'Logout';
        loginBtn.href = '#';
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                await signOut();
            }
        });
    }
    
    // Add logout to avatar
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                await signOut();
            }
        });
    }
    
    // Load real data
    await loadDashboardData();
})();

async function loadDashboardData() {
    try {
        // Get counts from database
        const [patientsResult, studiesResult] = await Promise.all([
            supabase.from('patients').select('*', { count: 'exact' }),
            supabase.from('studies').select('*', { count: 'exact' })
        ]);
        
        const totalPatients = patientsResult.data?.length || 0;
        const allStudies = studiesResult.data || [];
        const totalStudies = allStudies.length;
        const pendingStudies = allStudies.filter(s => s.status === 'pending').length;
        const completedStudies = allStudies.filter(s => s.status === 'completed').length;
        
        // Update the UI
        document.getElementById('totalStudies').textContent = totalStudies.toLocaleString();
        document.getElementById('pendingReads').textContent = pendingStudies.toLocaleString();
        document.getElementById('completedStudies').textContent = completedStudies.toLocaleString();
        document.getElementById('totalPatients').textContent = totalPatients.toLocaleString();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        document.getElementById('totalStudies').textContent = 'Error';
        document.getElementById('pendingReads').textContent = 'Error';
        document.getElementById('completedStudies').textContent = 'Error';
        document.getElementById('totalPatients').textContent = 'Error';
    }
}