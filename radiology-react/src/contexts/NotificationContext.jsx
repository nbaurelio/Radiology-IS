import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      timestamp: new Date(),
      status: 'unread',
      ...notification
    }

    setNotifications(prev => [newNotification, ...prev])
    
    // Auto-remove after 5 seconds if it's a toast-style notification
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }

    return id
  }, [])

  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Mark as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'read' } : n)
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'read' }))
    )
  }, [])

  // Archive notification
  const archiveNotification = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'archived' } : n)
    )
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Get unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length

  // Get active notifications (not archived)
  const activeNotifications = notifications.filter(n => n.status !== 'archived')

  const value = {
    notifications: activeNotifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    clearAll,
    unreadCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
