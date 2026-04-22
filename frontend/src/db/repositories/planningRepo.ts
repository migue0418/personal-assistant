import { db } from '@/db/database'
import type { Task, WeeklyPlan } from '@/features/weekly-planning/types'

const STATUS_CYCLE: Record<Task['status'], Task['status']> = {
  pending: 'done',
  done: 'skipped',
  skipped: 'pending',
}

export const planningRepo = {
  async getOrCreateWeekPlan(weekStart: string): Promise<WeeklyPlan> {
    const existing = await db.weeklyPlans
      .where('weekStart')
      .equals(weekStart)
      .first()
    if (existing) return existing
    const id = await db.weeklyPlans.add({ weekStart })
    return { id, weekStart }
  },

  getTasksByWeek(planId: number): Promise<Task[]> {
    return db.tasks.where('planId').equals(planId).toArray()
  },

  getTasksByDate(planId: number, date: string): Promise<Task[]> {
    return db.tasks
      .where('planId')
      .equals(planId)
      .filter((t) => t.date === date)
      .toArray()
  },

  addTask(task: Omit<Task, 'id'>): Promise<number> {
    return db.tasks.add(task)
  },

  async updateTask(
    id: number,
    changes: Partial<Omit<Task, 'id'>>,
  ): Promise<void> {
    await db.tasks.update(id, changes)
  },

  async deleteTask(id: number): Promise<void> {
    await db.tasks.delete(id)
  },

  async toggleTaskStatus(
    id: number,
    currentStatus: Task['status'],
  ): Promise<void> {
    await db.tasks.update(id, { status: STATUS_CYCLE[currentStatus] })
  },
}
