// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  postLoginLoading: boolean;
  refreshUser: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [postLoginLoading, setPostLoginLoading] = useState(false)

  useEffect(() => {
    checkAuth();
  }, []);

    const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        console.log('Token refreshed successfully')
        return true
      } else {
        console.error('Failed to refresh token')
        await logout()
        return false
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      await logout()
      return false
    }
  }

  const checkAuth = async () => {
    // Skip auth check jika di halaman auth
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include',
        // Tambahkan cache control
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.data?.user || data.user
        if (userData) {
          setUser({
            id: userData.id || userData._id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            verified: userData.verified,
          })
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true);
    setPostLoginLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login response:', data);

      // SET USER DATA LANGSUNG DARI RESPONSE LOGIN
      const userData = data.data?.user || data.user;
      if (userData) {
        setUser({
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified,
        });
      }

      // Tunggu sebentar untuk memastikan state ter-update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
      setPostLoginLoading(false);
    }
  };

  const loginWithGoogle = async (token: string) => {
    setLoading(true);
    setPostLoginLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Google login failed');
      }

      const data = await response.json();
      console.log('Google login response:', data);

      // SET USER DATA LANGSUNG DARI RESPONSE
      const userData = data.data?.user || data.user;
      if (userData) {
        setUser({
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
      setPostLoginLoading(false);
    }
  };

  // contexts/AuthContext.tsx - perbaiki register function
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setPostLoginLoading(true); // Tambahkan ini
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Register response:', data);

      // SET USER DATA LANGSUNG DARI RESPONSE (konsisten dengan login)
      const userData = data.data?.user || data.user;
      if (userData) {
        setUser({
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified,
        });
      }

      // Tunggu sebentar untuk memastikan state ter-update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect ke dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
      setPostLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      router.push('/auth/sign-in');
    }
  };

   // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get current user
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Setup automatic token refresh
  useEffect(() => {
    if (!user) return

    const REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutes

    const refreshInterval = setInterval(async () => {
      const success = await refreshToken()
      if (success) {
        // Update user data after token refresh
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
        }
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(refreshInterval)
  }, [user])

  // Setup response interceptor for token refresh on 401 errors
  useEffect(() => {
    if (!user) return

    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      let response = await originalFetch(...args)

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshSuccess = await refreshToken()
        
        if (refreshSuccess) {
          // Retry the original request with new token
          response = await originalFetch(...args)
        } else {
          // Refresh failed, logout user
          await logout()
        }
      }

      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [user])

  const refreshUser = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data?.user || data.user;
        if (userData) {
          setUser({
            id: userData.id || userData._id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            verified: userData.verified,
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Refresh user failed:', error);
      return false;
    }
  };

   const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        return data.data.user
      }
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        loading,
        postLoginLoading,
        refreshUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook untuk menggunakan auth context
export const useAuthUser = () => {
  const { user } = useAuth()
  return user
}

export const useAuthLoading = () => {
  const { loading } = useAuth()
  return loading
}

export const useAuthActions = () => {
  const { login, logout, refreshToken } = useAuth()
  return { login, logout, refreshToken }
}