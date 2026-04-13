'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'

export interface NotificationState {
  permission: NotificationPermission | 'unsupported'
  isSupported: boolean
  isEnabled: boolean
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
    isEnabled: false,
  })
  
  const settings = useAppStore((state) => state.settings)
  const updateNotification = useAppStore((state) => state.updateNotification)

  // Check notification support and permission on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator
    
    if (!isSupported) {
      setState({
        permission: 'unsupported',
        isSupported: false,
        isEnabled: false,
      })
      return
    }

    setState({
      permission: Notification.permission,
      isSupported: true,
      isEnabled: Notification.permission === 'granted' && settings.notifications.push,
    })
  }, [settings.notifications.push])

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: permission === 'granted',
      }))

      if (permission === 'granted') {
        updateNotification('push', true)
        // Register service worker for push
        await registerServiceWorker()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [state.isSupported, updateNotification])

  // Register service worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration.scope)
        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  // Send local notification
  const sendNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> => {
    if (!state.isEnabled) {
      console.warn('Notifications not enabled')
      return false
    }

    try {
      // Try to use service worker notification (works when app is in background)
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/logo.png',
        badge: '/favicon-48.png',
        vibrate: [200, 100, 200],
        tag: 'whippy-notification',
        renotify: true,
        ...options,
      })
      return true
    } catch (error) {
      // Fallback to regular notification
      try {
        new Notification(title, {
          icon: '/logo.png',
          badge: '/favicon-48.png',
          ...options,
        })
        return true
      } catch (e) {
        console.error('Error sending notification:', e)
        return false
      }
    }
  }, [state.isEnabled])

  // Schedule daily reminder
  const scheduleDailyReminder = useCallback((hour: number, minute: number = 0) => {
    // Store in localStorage for service worker to pick up
    const reminderTime = { hour, minute }
    localStorage.setItem('whippy-reminder-time', JSON.stringify(reminderTime))
    
    // Calculate next reminder time
    const now = new Date()
    const reminderDate = new Date()
    reminderDate.setHours(hour, minute, 0, 0)
    
    // If time already passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1)
    }
    
    const msUntilReminder = reminderDate.getTime() - now.getTime()
    
    // Set timeout for next reminder (will be reset on page reload)
    // For persistent reminders, we'll use the service worker
    const timeoutId = setTimeout(() => {
      sendNotification('Whippy Hatırlatıcı 🔥', {
        body: 'Bugünkü alışkanlıklarını tamamlamayı unutma!',
        tag: 'daily-reminder',
        data: { url: '/habits' },
      })
      
      // Schedule next day
      scheduleDailyReminder(hour, minute)
    }, msUntilReminder)
    
    // Store timeout ID for cleanup
    localStorage.setItem('whippy-reminder-timeout', timeoutId.toString())
    
    return reminderDate
  }, [sendNotification])

  // Cancel daily reminder
  const cancelDailyReminder = useCallback(() => {
    const timeoutId = localStorage.getItem('whippy-reminder-timeout')
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId))
      localStorage.removeItem('whippy-reminder-timeout')
    }
    localStorage.removeItem('whippy-reminder-time')
  }, [])

  // Get stored reminder time
  const getReminderTime = useCallback((): { hour: number; minute: number } | null => {
    const stored = localStorage.getItem('whippy-reminder-time')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }, [])

  // Send test notification
  const sendTestNotification = useCallback(() => {
    return sendNotification('Whippy Test 🎉', {
      body: 'Bildirimler çalışıyor! Harika!',
      tag: 'test-notification',
    })
  }, [sendNotification])

  // Quick reminder notifications
  const sendHabitReminder = useCallback((habitName: string) => {
    return sendNotification(`${habitName} zamanı! ⏰`, {
      body: 'Bu alışkanlığı tamamlamayı unutma.',
      tag: `habit-${habitName}`,
      data: { url: '/habits' },
    })
  }, [sendNotification])

  const sendMotivation = useCallback((message: string) => {
    return sendNotification('Whippy Koçun 🔥', {
      body: message,
      tag: 'motivation',
    })
  }, [sendNotification])

  const sendStreakAlert = useCallback((streak: number, habitName: string) => {
    return sendNotification(`${streak} Günlük Seri! 🏆`, {
      body: `${habitName} için harika gidiyorsun!`,
      tag: 'streak-alert',
      data: { url: '/habits' },
    })
  }, [sendNotification])

  return {
    ...state,
    requestPermission,
    sendNotification,
    sendTestNotification,
    sendHabitReminder,
    sendMotivation,
    sendStreakAlert,
    scheduleDailyReminder,
    cancelDailyReminder,
    getReminderTime,
  }
}
