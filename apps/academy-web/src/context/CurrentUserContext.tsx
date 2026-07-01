"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { fetchApi } from '@/lib/useApi'

interface CurrentUserContextType {
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  studentId: string | null;
  employeeId: string | null;
  clientId: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  
  // Notification fields (Phase 3)
  notifications: any[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextType>({
  userId: null,
  email: null,
  firstName: null,
  lastName: null,
  role: null,
  studentId: null,
  employeeId: null,
  clientId: null,
  avatarUrl: null,
  isLoading: true,
  notifications: [],
  unreadCount: 0,
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},
})

export const useCurrentUser = () => useContext(CurrentUserContext)

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch exact user details including studentId
      fetchApi('/auth/me')
        .then((res: any) => {
          if (res.user) {
            setUserData(res.user)
          }
        })
        .catch((e: any) => {
           if (e.message?.includes('401') || e.message?.includes('404')) {
             console.warn('User not authenticated');
           } else {
             console.error(e);
           }
        })
        .finally(() => setIsLoading(false))
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
      setUserData(null)
    }
  }, [status])

  useEffect(() => {
    if (!userData?.id) return;

    // Fetch initial notifications
    const loadNotifications = async () => {
      try {
        const res = await fetchApi<any>('/notifications');
        if (res?.notifications) setNotifications(res.notifications);
      } catch (e: any) {
        if (e.message?.includes('401') || e.message?.includes('404')) {
           // Silently ignore or warn
        } else {
           console.error("Failed to load notifications", e);
        }
      }
    };
    
    loadNotifications();

    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [userData?.id]);

  const markNotificationRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await fetchApi(`/notifications/read-all`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <CurrentUserContext.Provider value={{
      userId: userData?.id || null,
      email: userData?.email || null,
      firstName: userData?.firstName || null,
      lastName: userData?.lastName || null,
      role: userData?.role || null,
      studentId: userData?.studentId || null,
      employeeId: userData?.employeeId || null,
      clientId: userData?.clientId || null,
      avatarUrl: userData?.avatarUrl || null,
      isLoading: isLoading || status === 'loading',
      notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      {children}
    </CurrentUserContext.Provider>
  )
}
