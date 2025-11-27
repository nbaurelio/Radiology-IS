import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [theme, setTheme] = useState('light')
  const tabsRef = useRef(null)
  const indicatorRef = useRef(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  useEffect(() => {
    // Setup tab indicator animation
    const setupTabIndicator = () => {
      const tabs = tabsRef.current?.querySelectorAll('.tab')
      const indicator = indicatorRef.current
      const activeTab = tabsRef.current?.querySelector('.tab.active')
      
      if (!indicator || !activeTab || !tabs) return
      
      // Position indicator on active tab
      const updateIndicator = (tab, instant = false) => {
        const tabRect = tab.getBoundingClientRect()
        const tabsContainer = tab.parentElement.getBoundingClientRect()
        const left = tabRect.left - tabsContainer.left
        const width = tabRect.width
        
        if (instant) {
          indicator.style.transition = 'none'
          indicator.style.left = `${left}px`
          indicator.style.width = `${width}px`
          indicator.offsetHeight // Force reflow
          indicator.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        } else {
          indicator.style.left = `${left}px`
          indicator.style.width = `${width}px`
        }
      }
      
      // Initial position - instant, no animation
      updateIndicator(activeTab, true)
      
      // Hover effect - with animation
      tabs.forEach(tab => {
        tab.addEventListener('mouseenter', () => {
          updateIndicator(tab, false)
        })
      })
      
      // Return to active tab when mouse leaves - with animation
      if (tabsRef.current) {
        tabsRef.current.addEventListener('mouseleave', () => {
          updateIndicator(activeTab, false)
        })
      }
      
      // Update on window resize - instant
      const handleResize = () => {
        updateIndicator(activeTab, true)
      }
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(setupTabIndicator, 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const getPageTitle = (pathname) => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/upload': 'Upload DICOM',
      '/reports': 'Reports',
      '/telehealth': 'Telehealth',
      '/patients': 'Patients',
      '/patients/add': 'Add Patient',
      '/reports/add': 'Add Report',
      '/admin': 'Admin'
    }
    return titles[pathname] || 'Dashboard'
  }

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return [{ path: '/dashboard', label: 'Dashboard' }]
    
    const role = user.userType || 'Rad Tech' // Default to Rad Tech if not set
    
    // Define tabs for each role
    const roleTabs = {
      'Hospital Admin': [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/upload', label: 'Upload DICOM' },
        { path: '/reports', label: 'Reports' },
        { path: '/patients', label: 'Patients' },
        { path: '/telehealth', label: 'Telehealth' },
        { path: '/admin', label: 'Admin' }
      ],
      'Radiologist': [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/reports', label: 'Reports' }
      ],
      'Rad Tech': [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/upload', label: 'Upload DICOM' },
        { path: '/patients', label: 'Patients' }
      ]
    }
    
    return roleTabs[role] || []
  }

  return (
    <header className="topnav">
      <div className="row">
        <div className="brand">
          <span className="logo"></span>
          <div>
            XferDx
            <small>{getPageTitle(location.pathname)}</small>
          </div>
        </div>
        
        <div className="spacer"></div>
        
        <div className="actions">
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <button onClick={handleLogout} className="btn">
            Logout
          </button>
          
          <div className="avatar" aria-label="Profile"></div>
        </div>
      </div>

      <nav className="tabs" aria-label="Primary" ref={tabsRef}>
        {getNavItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`tab ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
        <div className="tab-indicator" ref={indicatorRef}></div>
      </nav>
    </header>
  )
}

export default Header
