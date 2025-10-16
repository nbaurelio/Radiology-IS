import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ activePage }) {
  const [theme, setTheme] = useState('light');
  const location = useLocation();
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    // Setup tab indicator animation
    setupTabIndicator();
    
    // Update on window resize
    const handleResize = () => setupTabIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const setupTabIndicator = () => {
    const tabs = tabsRef.current?.querySelectorAll('.tab');
    const indicator = indicatorRef.current;
    const activeTab = tabsRef.current?.querySelector('.tab.active');
    
    if (!indicator || !activeTab || !tabs) return;
    
    const updateIndicator = (tab, instant = false) => {
      const tabRect = tab.getBoundingClientRect();
      const tabsContainer = tab.parentElement.getBoundingClientRect();
      const left = tabRect.left - tabsContainer.left;
      const width = tabRect.width;
      
      if (instant) {
        indicator.style.transition = 'none';
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
        void indicator.offsetHeight; // Force reflow
        indicator.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      } else {
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
      }
    };
    
    // Initial position
    updateIndicator(activeTab, true);
    
    // Hover effect
    tabs.forEach(tab => {
      tab.addEventListener('mouseenter', () => updateIndicator(tab, false));
    });
    
    // Return to active on mouse leave
    if (tabsRef.current) {
      tabsRef.current.addEventListener('mouseleave', () => updateIndicator(activeTab, false));
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      window.location.href = '/login';
    }
  };

  const getPageTitle = (path) => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/upload': 'Upload DICOM',
      '/reports': 'Reports',
      '/telehealth': 'Telehealth',
      '/patients': 'Patients'
    };
    return titles[path] || 'Dashboard';
  };

  const tabs = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload DICOM', path: '/upload' },
    { name: 'Reports', path: '/reports' },
    { name: 'Telehealth', path: '/telehealth' },
    { name: 'Patients', path: '/patients' },
  ];

  return (
    <>
      <header className="topnav">
        <div className="row">
          <div className="brand">
            <span className="logo"></span>
            <div>
              Radiology IS
              <small>{getPageTitle(location.pathname)}</small>
            </div>
          </div>
          <div className="spacer"></div>
          <div className="actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="btn" onClick={handleLogout}>Logout</button>
            <div className="avatar" aria-label="Profile"></div>
          </div>
        </div>

        {/* Tabs with smooth transition */}
        <nav className="tabs" aria-label="Primary" ref={tabsRef}>
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`tab ${location.pathname === tab.path ? 'active' : ''}`}
            >
              {tab.name}
            </Link>
          ))}
          <div className="tab-indicator" ref={indicatorRef}></div>
        </nav>
      </header>
    </>
  );
}

export default Header;
