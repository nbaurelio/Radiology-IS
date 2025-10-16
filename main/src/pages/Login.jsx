import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

function Login() {
  const [userId, setUserId] = useState('ADMIN001');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const btn = e.target.querySelector('.btn-login');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    // Simulate authentication - replace with your actual auth logic
    setTimeout(() => {
      if (userId && password) {
        // Success - navigate to dashboard
        navigate('/dashboard');
      } else {
        setErrorMessage('Invalid credentials. Please try again.');
        btn.textContent = 'Login';
        btn.disabled = false;
      }
    }, 500);
  };

  return (
    <div className="login-page-wrapper">
      <button 
        id="themeToggle" 
        className="theme-toggle-login" 
        aria-label="Toggle theme"
        onClick={toggleTheme}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-large"></div>
            <h1>Radiology IS</h1>
            <p className="subtitle">Sign in to your account</p>
          </div>

          <form id="loginForm" className="login-form" onSubmit={handleLogin}>
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
              />
            </div>

            <button type="submit" className="btn-login">Login</button>
            
            {errorMessage && (
              <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '12px', fontSize: '14px' }}>
                {errorMessage}
              </div>
            )}
          </form>

          <div className="login-footer">
            <p className="muted">Superuser access only</p>
            <p className="muted" style={{ marginTop: '8px', fontSize: '12px' }}>
              Test users:<br />
              Admin: ADMIN001 / admin123<br />
              Radiologist: RAD001 / admin123<br />
              Rad Tech: TECH001 / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
