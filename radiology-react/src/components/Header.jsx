import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { Bell } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()
  const [theme, setTheme] = useState('light')
  const [showNotifications, setShowNotifications] = useState(false)
  const tabsRef = useRef(null)
  const indicatorRef = useRef(null)
  const notificationRef = useRef(null)

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

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    if (notification.actionLink) {
      // Navigate to the action link using React Router
      setShowNotifications(false)
      navigate(notification.actionLink)
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffMs = now - notifTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifTime.toLocaleDateString()
  }

  const getPriorityColor = (priority) => {
    const colors = {
      stat: '#ef4444',      // red
      urgent: '#f59e0b',    // amber
      routine: '#3b82f6'    // blue
    }
    return colors[priority] || colors.routine
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
          <div className="notification-container" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="notification-btn"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        clearAll()
                        setShowNotifications(false)
                      }}
                      className="clear-btn"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`notification-item ${notification.status}`}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          borderLeftColor: getPriorityColor(notification.priority),
                          borderLeftWidth: '3px'
                        }}
                      >
                        <div className="notification-content">
                          <p className="notification-title">{notification.title}</p>
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">{formatTime(notification.timestamp)}</span>
                        </div>
                        {notification.status === 'unread' && <div className="unread-indicator"></div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
