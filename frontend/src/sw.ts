/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('periodicsync', event => {
  const psEvent = event as Event & { tag: string; waitUntil: (p: Promise<unknown>) => void }
  if (psEvent.tag === 'fire-reminders') {
    psEvent.waitUntil(fireAllDueReminders())
  }
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.startsWith(self.location.origin))
      if (existing) return existing.focus()
      return self.clients.openWindow('/')
    })
  )
})

// ── Native IDB helpers (no Dexie import to keep SW bundle small) ─────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('personal-assistant', 4)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IDB open failed'))
    // If the SW fires before the app has upgraded to v4, upgrade here too
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('taskReminders')) {
        const store = db.createObjectStore('taskReminders', { keyPath: 'id', autoIncrement: true })
        store.createIndex('taskId', 'taskId', { unique: false })
        store.createIndex('scheduledAt', 'scheduledAt', { unique: false })
        store.createIndex('fired', 'fired', { unique: false })
      }
    }
  })
}

interface RawReminder {
  id: number
  taskTitle: string
  scheduledAt: string
  minutesBefore: number
  fired: number
}

function getRemindersDue(db: IDBDatabase, now: string): Promise<RawReminder[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('taskReminders', 'readonly')
    const store = tx.objectStore('taskReminders')
    const index = store.index('scheduledAt')
    const range = IDBKeyRange.upperBound(now)
    const req = index.getAll(range)
    req.onsuccess = () => resolve((req.result as RawReminder[]).filter(r => r.fired === 0))
    req.onerror = () => reject(req.error ?? new Error('IDB open failed'))
  })
}

function markFiredIDB(db: IDBDatabase, id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('taskReminders', 'readwrite')
    const store = tx.objectStore('taskReminders')
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      const record = getReq.result as RawReminder | undefined
      if (!record) {
        resolve()
        return
      }
      const putReq = store.put({ ...record, fired: 1 })
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error ?? new Error('IDB put failed'))
    }
    getReq.onerror = () => reject(getReq.error ?? new Error('IDB get failed'))
  })
}

function buildBody(minutesBefore: number): string {
  if (minutesBefore === 10) return 'En 10 minutos'
  if (minutesBefore === 60) return 'En 1 hora'
  if (minutesBefore === 1440) return 'Mañana'
  return 'En 1 semana'
}

async function fireAllDueReminders(): Promise<void> {
  const db = await openDB()
  const now = new Date().toISOString()
  const due = await getRemindersDue(db, now)
  for (const r of due) {
    await self.registration.showNotification(r.taskTitle, {
      body: buildBody(r.minutesBefore),
      icon: '/icons/icon-192.png',
      tag: `reminder-${r.id}`,
    })
    await markFiredIDB(db, r.id)
  }
  db.close()
}
