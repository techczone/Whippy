'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'

export interface NotificationState {
  permission: NotificationPermission | 'unsupported'
  isSupported: boolean
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
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
      })
      return
    }

    setState({
      permission: Notification.permission,
      isSupported: true,
    })

    // Register service worker on load
    if (Notification.permission === 'granted') {
      registerServiceWorker()
    }
  }, [])

  // Derived state
  const isEnabled = state.permission === 'granted'

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
      }))

      if (permission === 'granted') {
        updateNotification('push', true)
        await registerServiceWorker()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [state.isSupported, updateNotification])

  // Send notification - direct approach
  const sendNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> => {
    // Check permission directly
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return false
    }

    try {
      // First try service worker notification
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, {
          icon: '/logo.png',
          badge: '/favicon-48.png',
          vibrate: [200, 100, 200],
          tag: 'whippy-notification',
          renotify: true,
          ...options,
        })
        console.log('Notification sent via SW')
        return true
      }
    } catch (swError) {
      console.log('SW notification failed, trying direct:', swError)
    }

    // Fallback to direct notification
    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/favicon-48.png',
        ...options,
      })
      
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
      
      console.log('Direct notification sent')
      return true
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }, [])

  // Schedule daily reminder
  const scheduleDailyReminder = useCallback((hour: number, minute: number = 0) => {
    // Store in localStorage
    const reminderTime = { hour, minute }
    localStorage.setItem('whippy-reminder-time', JSON.stringify(reminderTime))
    
    // Clear existing timeout
    const existingTimeout = localStorage.getItem('whippy-reminder-timeout')
    if (existingTimeout) {
      clearTimeout(parseInt(existingTimeout))
    }
    
    // Calculate next reminder time
    const now = new Date()
    const reminderDate = new Date()
    reminderDate.setHours(hour, minute, 0, 0)
    
    // If time already passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1)
    }
    
    const msUntilReminder = reminderDate.getTime() - now.getTime()
    
    console.log(`Reminder scheduled in ${Math.round(msUntilReminder / 1000 / 60)} minutes`)
    
    // Set timeout
    const timeoutId = window.setTimeout(() => {
      sendNotification('Whippy Hatırlatıcı 🔥', {
        body: 'Bugünkü alışkanlıklarını tamamlamayı unutma!',
        tag: 'daily-reminder',
      })
      
      // Schedule next day
      scheduleDailyReminder(hour, minute)
    }, msUntilReminder)
    
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
    if (typeof window === 'undefined') return null
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
    })
  }, [sendNotification])

  return {
    permission: state.permission,
    isSupported: state.isSupported,
    isEnabled,
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
