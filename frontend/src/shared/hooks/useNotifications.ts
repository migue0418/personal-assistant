import { useEffect } from 'react'
import { remindersRepo } from '@/db/repositories/remindersRepo'
import { buildNotificationBody } from '@/features/weekly-planning/utils/reminderUtils'

export function useNotifications(): void {
  useEffect(() => {
    if (!('Notification' in window)) return

    // Request permission non-blocking
    void Notification.requestPermission()

    // Register Periodic Background Sync if supported
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.ready.then(async reg => {
        const ps = (
          reg as ServiceWorkerRegistration & {
            periodicSync?: {
              getTags: () => Promise<string[]>
              register: (tag: string, opts: { minInterval: number }) => Promise<void>
            }
          }
        ).periodicSync
        if (!ps) return
        try {
          const tags = await ps.getTags()
          if (!tags.includes('fire-reminders')) {
            await ps.register('fire-reminders', { minInterval: 15 * 60 * 1000 })
          }
        } catch {
          // PBS not granted or not supported — silently ignore
        }
      })
    }

    // Fire due reminders that were missed while app was closed
    void remindersRepo.getDueNow().then(async due => {
      if (Notification.permission !== 'granted') return
      for (const r of due) {
        new Notification(r.taskTitle, {
          body: buildNotificationBody(r.minutesBefore),
          icon: '/icons/icon-192.png',
          tag: `reminder-${r.id}`,
        })
        await remindersRepo.markFired(r.id)
      }
    })

    // Schedule setTimeout for all future pending reminders
    void remindersRepo.getFuturePending().then(pending => {
      if (Notification.permission !== 'granted') return
      const now = Date.now()
      for (const r of pending) {
        const delay = new Date(r.scheduledAt).getTime() - now
        if (delay <= 0) continue
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(r.taskTitle, {
              body: buildNotificationBody(r.minutesBefore),
              icon: '/icons/icon-192.png',
              tag: `reminder-${r.id}`,
            })
            void remindersRepo.markFired(r.id)
          }
        }, delay)
      }
    })
  }, [])
}
