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
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [postLoginLoading, setPostLoginLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function untuk mendapatkan user data
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data?.user || data.user;
        if (userData) {
          return {
            id: userData.id || userData._id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            verified: userData.verified,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Failed to refresh token');
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
      return false;
    }
  };

  // SINGLE useEffect untuk initialize auth
  useEffect(() => {
    const initializeAuth = async () => {
      // Skip auth check untuk halaman auth
      if (pathname?.startsWith('/auth')) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Hanya run sekali saat mount

  // Setup automatic token refresh
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 menit (sebelum token expire)

    const refreshInterval = setInterval(async () => {
      const success = await refreshToken();
      if (success) {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [user]);

const login = async (email: string, password: string) => {
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
    const userData = data.data?.user || data.user;
    
    if (userData) {
      setUser({
        id: userData.id || userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        verified: userData.verified,
      });
      
      // Hard redirect (last resort)
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login error:', error);
    setPostLoginLoading(false);
    throw error;
  }
};

  const loginWithGoogle = async (token: string) => {
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

      const userData = data.data?.user || data.user;
      if (userData) {
        const newUser = {
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified,
        };
        setUser(newUser);
        
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 100);
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setPostLoginLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setPostLoginLoading(true);
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

      const userData = data.data?.user || data.user;
      if (userData) {
        const newUser = {
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified,
        };
        setUser(newUser);
        
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 100);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
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
      router.refresh();
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh user failed:', error);
      return false;
    }
  };

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

export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthLoading = () => {
  const { loading } = useAuth();
  return loading;
};

export const useAuthActions = () => {
  const { login, logout, refreshToken } = useAuth();
  return { login, logout, refreshToken };
};