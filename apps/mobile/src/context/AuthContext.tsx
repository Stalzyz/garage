import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { storage } from '../services/api';
import { biometrics } from '../services/biometrics';
import { CONFIG } from '../config/constants';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  demoLogin: (role: 'GARAGE' | 'PARTNER') => Promise<void>;
  biometricUnlock: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on boot
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await storage.getItem(CONFIG.STORAGE_TOKEN);
        const storedUser = await storage.getItem(CONFIG.STORAGE_USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.warn('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check for quick demo accounts or API auth
      if (email.toLowerCase().includes('demo@garage.in') && pass === 'Demo2023') {
        const demoUser: User = {
          id: 'demo-garage-user-id',
          name: 'Demo Agency Founder',
          email: 'demo@garage.in',
          role: 'ADMIN',
        };
        await saveSession('mock-garage-demo-token-jwt', demoUser);
        return true;
      }

      if (email.toLowerCase().includes('reseller@grekam.com') && pass === 'reseller123') {
        const demoUser: User = {
          id: 'demo-reseller-id',
          name: 'Demo Reseller Partner',
          email: 'reseller@grekam.com',
          role: 'RESELLER_ADMIN',
        };
        await saveSession('mock-reseller-demo-token-jwt', demoUser);
        return true;
      }

      // Try live server API
      const res = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!res.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await res.json();
      const authenticatedUser: User = {
        id: data.user?.id || 'user-id',
        name: data.user?.name || `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || 'User',
        email: data.user?.email || email,
        role: data.user?.role || 'STAFF',
      };

      await saveSession(data.token || 'live-session-token', authenticatedUser);
      return true;
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Login failed. Please verify your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'GARAGE' | 'PARTNER') => {
    setIsLoading(true);
    try {
      if (role === 'GARAGE') {
        const demoUser: User = {
          id: 'demo-garage-user-id',
          name: 'Demo Agency Founder',
          email: 'demo@garage.in',
          role: 'ADMIN',
        };
        await saveSession('mock-garage-demo-token-jwt', demoUser);
      } else {
        const demoUser: User = {
          id: 'demo-reseller-id',
          name: 'Demo Reseller Partner',
          email: 'reseller@grekam.com',
          role: 'RESELLER_ADMIN',
        };
        await saveSession('mock-reseller-demo-token-jwt', demoUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async (tokenStr: string, userObj: User) => {
    setToken(tokenStr);
    setUser(userObj);
    await storage.setItem(CONFIG.STORAGE_TOKEN, tokenStr);
    await storage.setItem(CONFIG.STORAGE_USER, JSON.stringify(userObj));
  };

  const biometricUnlock = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const isEnrolled = await biometrics.isAvailable();
      if (!isEnrolled) {
        Alert.alert('Biometrics Unavailable', 'Biometrics (FaceID / Fingerprint) is not enrolled on this device.');
        return false;
      }

      const success = await biometrics.authenticate('Unlock Grekam OS Workspace');
      if (success) {
        const storedToken = await storage.getItem(CONFIG.STORAGE_TOKEN);
        const storedUser = await storage.getItem(CONFIG.STORAGE_USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Default to garage owner preview session
          const defaultUser: User = {
            id: 'demo-garage-user-id',
            name: 'Demo Agency Founder',
            email: 'demo@garage.in',
            role: 'ADMIN',
          };
          await saveSession('mock-garage-demo-token-jwt', defaultUser);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('Biometric error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.removeItem(CONFIG.STORAGE_TOKEN);
    await storage.removeItem(CONFIG.STORAGE_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        demoLogin,
        biometricUnlock,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
