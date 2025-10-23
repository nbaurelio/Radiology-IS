// Shared Header Component
// This file creates a consistent header across all pages with smooth animations

function createHeader(activePage) {
    const currentUser = authService.getCurrentUser();
    const userName = currentUser ? currentUser.firstName : 'User';
    
    return `
        <header class="topnav">
            <div class="row">
                <div class="brand">
                    <span class="logo"></span>
                    <div>
                        XferDx
                        <small>${getPageTitle(activePage)}</small>
                    </div>
                </div>
                <div class="spacer"></div>
                <div class="actions">
                    <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme">🌙</button>
                    <button class="btn" id="logoutBtn">Logout</button>
                    <div class="avatar" aria-label="Profile"></div>
                </div>
            </div>

            <!-- Tabs with smooth transition -->
            <nav class="tabs" aria-label="Primary">
                <a class="tab ${activePage === 'dashboard' ? 'active' : ''}" href="../Dashboard/dashboard.html">Dashboard</a>
                <a class="tab ${activePage === 'upload' ? 'active' : ''}" href="../Upload/upload-dicom.html">Upload DICOM</a>
                <a class="tab ${activePage === 'reports' ? 'active' : ''}" href="../Reports/reports.html">Reports</a>
                <a class="tab ${activePage === 'telehealth' ? 'active' : ''}" href="#">Telehealth</a>
                <a class="tab ${activePage === 'patients' ? 'active' : ''}" href="../Patients/patients.html">Patients</a>
                <div class="tab-indicator"></div>
            </nav>
        </header>
    `;
}

function getPageTitle(page) {
    const titles = {
        'dashboard': 'Dashboard',
        'upload': 'Upload DICOM',
        'reports': 'Reports',
        'telehealth': 'Telehealth',
        'patients': 'Patients',
        'patient-detail': 'Patient Details'
    };
    return titles[page] || 'Dashboard';
}

// Initialize header on page load
function initializeHeader(activePage) {
    // Insert header HTML
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = createHeader(activePage);
    }
    
    // Setup logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                authService.logout();
            }
        });
    }
    
    // Setup smooth page transitions for navigation links
    setupSmoothNavigation();
    
    // Setup tab indicator animation
    setupTabIndicator();
}

// Setup smooth page transitions
function setupSmoothNavigation() {
    const navLinks = document.querySelectorAll('.tab');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only apply transition for actual page links (not # links)
            if (href && href !== '#' && !href.startsWith('javascript:')) {
                e.preventDefault();
                
                // Add fade-out class
                document.body.classList.add('page-transition');
                
                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, 150);
            }
        });
    });
}

// Setup smooth tab indicator animation
function setupTabIndicator() {
    const tabs = document.querySelectorAll('.tab');
    const indicator = document.querySelector('.tab-indicator');
    const activeTab = document.querySelector('.tab.active');
    
    if (!indicator || !activeTab) return;
    
    // Position indicator on active tab
    function updateIndicator(tab, instant = false) {
        const tabRect = tab.getBoundingClientRect();
        const tabsContainer = tab.parentElement.getBoundingClientRect();
        const left = tabRect.left - tabsContainer.left;
        const width = tabRect.width;
        
        if (instant) {
            // Disable transition for instant positioning
            indicator.style.transition = 'none';
            indicator.style.left = `${left}px`;
            indicator.style.width = `${width}px`;
            // Force reflow
            indicator.offsetHeight;
            // Re-enable transition
            indicator.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            indicator.style.left = `${left}px`;
            indicator.style.width = `${width}px`;
        }
    }
    
    // Initial position - instant, no animation
    updateIndicator(activeTab, true);
    
    // Hover effect - with animation
    tabs.forEach(tab => {
        tab.addEventListener('mouseenter', () => {
            updateIndicator(tab, false);
        });
    });
    
    // Return to active tab when mouse leaves - with animation
    const tabsContainer = document.querySelector('.tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('mouseleave', () => {
            updateIndicator(activeTab, false);
        });
    }
    
    // Update on window resize - instant
    window.addEventListener('resize', () => {
        updateIndicator(activeTab, true);
    });
}

// Export for use in pages
window.headerComponent = {
    initialize: initializeHeader
};
