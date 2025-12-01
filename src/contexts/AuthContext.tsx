'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Ref untuk mencegah multiple refresh calls
  const isRefreshing = useRef(false);

  // Helper function untuk mendapatkan user data
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
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
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
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
        setUser(null);
        router.push('/auth/sign-in');
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setUser(null);
      router.push('/auth/sign-in');
      return false;
    }
  }, [router]);

  const refreshUser = useCallback(async (): Promise<boolean> => {
    // Prevent multiple simultaneous refresh calls
    if (isRefreshing.current) {
      console.log('Refresh already in progress, skipping...');
      return false;
    }

    isRefreshing.current = true;
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
    } finally {
      isRefreshing.current = false;
    }
  }, [getCurrentUser]);

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
  }, [pathname, getCurrentUser]);

  // Setup automatic token refresh
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 menit

    const refreshInterval = setInterval(async () => {
      const success = await refreshToken();
      if (success) {
        await refreshUser();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
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

      const success = await refreshUser();
      
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 50));
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setPostLoginLoading(false);
    }
  }, [refreshUser, router]);

  const loginWithGoogle = useCallback(async (token: string) => {
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
  }, [router]);

  const register = useCallback(async (email: string, password: string, name: string) => {
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
  }, [router]);

  const logout = useCallback(async () => {
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
  }, [router]);

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