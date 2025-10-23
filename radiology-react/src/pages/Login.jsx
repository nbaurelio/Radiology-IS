import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [userId, setUserId] = useState('ADMIN001')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('light')
  
  const { user, login } = useAuth()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.body.className = 'login-page'
    
    return () => {
      document.body.className = ''
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(userId.trim(), password)
      
      if (!result.success) {
        setError(result.message || 'Invalid credentials. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={toggleTheme}
        className="theme-toggle-login" 
        aria-label="Toggle theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-large"></div>
            <h1>XferDx</h1>
            <p className="subtitle">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                className="form-input"
                placeholder="Enter your user ID"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{paddingLeft: '16px'}}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{paddingLeft: '16px'}}
              />
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            {error && (
              <div style={{color: 'var(--error)', textAlign: 'center', marginTop: '12px', fontSize: '14px'}}>
                {error}
              </div>
            )}
          </form>

          <div className="login-footer">
            <p className="muted">Superuser access only</p>
            <p className="muted" style={{marginTop: '8px', fontSize: '12px'}}>
              Test users:<br/>
              Admin: ADMIN001 / admin123<br/>
              Radiologist: RAD001 / admin123<br/>
              Rad Tech: TECH001 / admin123
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
