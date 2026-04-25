import { db } from '@/db/database'
import type { TaskReminder, ReminderOffset } from '@/features/weekly-planning/types'

export const remindersRepo = {
  async setRemindersForTask(
    taskId: number,
    taskTitle: string,
    items: { scheduledAt: string; minutesBefore: ReminderOffset }[]
  ): Promise<void> {
    await db.transaction('rw', [db.taskReminders], async () => {
      await db.taskReminders.where('taskId').equals(taskId).delete()
      if (items.length > 0) {
        await db.taskReminders.bulkAdd(
          items.map(item => ({
            taskId,
            taskTitle,
            scheduledAt: item.scheduledAt,
            minutesBefore: item.minutesBefore,
            fired: 0 as const,
          }))
        )
      }
    })
  },

  async getDueNow(): Promise<TaskReminder[]> {
    const now = new Date().toISOString()
    const due = await db.taskReminders.where('scheduledAt').belowOrEqual(now).toArray()
    return due.filter(r => r.fired === 0)
  },

  async getFuturePending(): Promise<TaskReminder[]> {
    const now = new Date().toISOString()
    const future = await db.taskReminders.where('scheduledAt').above(now).toArray()
    return future.filter(r => r.fired === 0)
  },

  async markFired(id: number): Promise<void> {
    await db.taskReminders.update(id, { fired: 1 })
  },

  async deleteByTaskId(taskId: number): Promise<void> {
    await db.taskReminders.where('taskId').equals(taskId).delete()
  },
}
