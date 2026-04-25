import { remindersRepo } from '@/db/repositories/remindersRepo'
import type { Task, ReminderOffset } from '@/features/weekly-planning/types'

export const REMINDER_OFFSETS: { value: ReminderOffset; label: string; requiresTime: boolean }[] = [
  { value: 10, label: '10 minutos antes', requiresTime: true },
  { value: 60, label: '1 hora antes', requiresTime: true },
  { value: 1440, label: '1 día antes (09:00)', requiresTime: false },
  { value: 10080, label: '1 semana antes (09:00)', requiresTime: false },
]

export function computeScheduledAt(
  date: string,
  timeStart: string | undefined,
  minutesBefore: ReminderOffset
): string | null {
  if ((minutesBefore === 10 || minutesBefore === 60) && !timeStart) return null

  let baseMs: number

  if (minutesBefore === 10 || minutesBefore === 60) {
    // timeStart is guaranteed non-undefined here
    baseMs = new Date(`${date}T${timeStart!}:00`).getTime()
  } else {
    // day/week offsets use 09:00 on that day, then subtract from there
    baseMs = new Date(`${date}T09:00:00`).getTime()
  }

  const scheduledMs = baseMs - minutesBefore * 60 * 1000
  return new Date(scheduledMs).toISOString()
}

export async function scheduleReminders(
  task: Pick<Task, 'id' | 'title' | 'date' | 'timeStart'>,
  offsets: ReminderOffset[]
): Promise<void> {
  if (!('Notification' in window)) return

  const now = Date.now()
  const survivors: { scheduledAt: string; minutesBefore: ReminderOffset }[] = []

  for (const offset of offsets) {
    const scheduledAt = computeScheduledAt(task.date, task.timeStart, offset)
    if (!scheduledAt) continue
    if (new Date(scheduledAt).getTime() <= now) continue
    survivors.push({ scheduledAt, minutesBefore: offset })
  }

  await remindersRepo.setRemindersForTask(task.id, task.title, survivors)

  if (Notification.permission !== 'granted') return

  for (const { scheduledAt, minutesBefore } of survivors) {
    const delay = new Date(scheduledAt).getTime() - now
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(task.title, {
          body: buildNotificationBody(minutesBefore),
          icon: '/icons/icon-192.png',
          tag: `reminder-${task.id}-${minutesBefore}`,
        })
      }
    }, delay)
  }
}

export function buildNotificationBody(minutesBefore: ReminderOffset): string {
  switch (minutesBefore) {
    case 10:
      return 'En 10 minutos'
    case 60:
      return 'En 1 hora'
    case 1440:
      return 'Mañana'
    case 10080:
      return 'En 1 semana'
  }
}
