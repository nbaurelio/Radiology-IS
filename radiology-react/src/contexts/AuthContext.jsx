import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const localSession = localStorage.getItem('userSession')
        if (localSession) {
          const userData = JSON.parse(localSession)
          
          // Verify with Supabase
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setUser(userData)
          } else {
            localStorage.removeItem('userSession')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
        localStorage.removeItem('userSession')
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          localStorage.removeItem('userSession')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (emailOrUserId, password) => {
    try {
      // Convert user_id to email if needed
      let email = emailOrUserId
      if (!emailOrUserId.includes('@')) {
        email = `${emailOrUserId.toLowerCase()}@radiology.local`
      }
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      if (authError) {
        throw authError
      }
      
      // Get user_id from metadata
      const userId = authData.user.user_metadata?.user_id
      
      if (!userId) {
        throw new Error('User metadata missing user_id. Please contact administrator.')
      }
      
      // Look up user details from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          user_types(type_name)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
      
      if (userError) {
        throw userError
      }
      
      if (!userData) {
        throw new Error('User account not found or inactive')
      }
      
      // Store user session
      const session = {
        id: userData.id,
        userId: userData.user_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        userType: userData.user_types.type_name,
        authUserId: authData.user.id,
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem('userSession', JSON.stringify(session))
      setUser(session)
      
      return { success: true, user: session }
      
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.message || 'Invalid credentials. Please try again.' 
      }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('userSession')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if Supabase signOut fails
      localStorage.removeItem('userSession')
      setUser(null)
    }
  }

  const hasUserType = (requiredType) => {
    if (!user) return false
    
    if (Array.isArray(requiredType)) {
      return requiredType.includes(user.userType)
    }
    return user.userType === requiredType
  }

  const value = {
    user,
    login,
    logout,
    hasUserType,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
