import { db } from '@/db/database'
import type {
  Task,
  WeeklyPlan,
  RecurringTaskSeries,
  RecurrenceFrequency,
  RecurrenceEndCondition,
  DeleteScope,
} from '@/features/weekly-planning/types'

const STATUS_CYCLE: Record<Task['status'], Task['status']> = {
  pending: 'done',
  done: 'skipped',
  skipped: 'pending',
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMonday(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISO(d)
}

function parseLocalDate(iso: string): Date {
  const parts = iso.split('-')
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
}

function generateOccurrenceDates(
  startDate: string,
  frequency: RecurrenceFrequency,
  endCondition: RecurrenceEndCondition,
  customDays?: number[]
): string[] {
  const cap = new Date()
  cap.setFullYear(cap.getFullYear() + 2)

  const dates: string[] = []
  const cursor = parseLocalDate(startDate)

  while (cursor <= cap) {
    const dayOfWeek = cursor.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let include = false
    if (frequency === 'daily') include = true
    else if (frequency === 'weekdays') include = !isWeekend
    else if (frequency === 'weekly') include = true
    else if (frequency === 'monthly') include = true
    else if (frequency === 'custom') include = (customDays ?? []).includes(dayOfWeek)

    if (include) {
      dates.push(toISO(cursor))
      if (endCondition.type === 'count' && dates.length === endCondition.times) break
      if (endCondition.type === 'date' && toISO(cursor) >= endCondition.until) break
    }

    if (frequency === 'weekly') {
      cursor.setDate(cursor.getDate() + 7)
    } else if (frequency === 'monthly') {
      // preserve day-of-month with overflow guard
      const originalDay = cursor.getDate()
      cursor.setMonth(cursor.getMonth() + 1)
      if (cursor.getDate() !== originalDay) {
        cursor.setDate(0)
      }
    } else {
      // daily, weekdays, custom: advance one day at a time
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  return dates
}

export const planningRepo = {
  async getOrCreateWeekPlan(weekStart: string): Promise<WeeklyPlan> {
    const existing = await db.weeklyPlans.where('weekStart').equals(weekStart).first()
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
      .filter(t => t.date === date)
      .toArray()
  },

  addTask(task: Omit<Task, 'id'>): Promise<number> {
    return db.tasks.add(task)
  },

  async updateTask(id: number, changes: Partial<Omit<Task, 'id'>>): Promise<void> {
    await db.tasks.update(id, changes)
  },

  async deleteTask(id: number): Promise<void> {
    await db.tasks.delete(id)
  },

  async toggleTaskStatus(id: number, currentStatus: Task['status']): Promise<void> {
    await db.tasks.update(id, { status: STATUS_CYCLE[currentStatus] })
  },

  async addRecurringTaskSeries(
    seriesData: Omit<RecurringTaskSeries, 'id'>,
    taskTemplate: Pick<Task, 'title' | 'timeStart' | 'timeEnd' | 'category'>,
    startDate: string
  ): Promise<number> {
    return db.transaction('rw', [db.recurringTaskSeries, db.tasks, db.weeklyPlans], async () => {
      const seriesId = (await db.recurringTaskSeries.add(seriesData)) as number

      const dates = generateOccurrenceDates(
        startDate,
        seriesData.frequency,
        seriesData.endCondition,
        seriesData.customDays
      )

      // Resolve unique weekStarts → planId map
      const weekStartSet = new Set(dates.map(d => getMonday(parseLocalDate(d))))
      const planMap = new Map<string, number>()

      for (const weekStart of weekStartSet) {
        const plan = await db.weeklyPlans.where('weekStart').equals(weekStart).first()
        if (plan) {
          planMap.set(weekStart, plan.id)
        } else {
          const id = await db.weeklyPlans.add({ weekStart })
          planMap.set(weekStart, id)
        }
      }

      const tasks: Omit<Task, 'id'>[] = dates.map(date => {
        const weekStart = getMonday(new Date(date + 'T00:00:00'))
        const t: Omit<Task, 'id'> = {
          planId: planMap.get(weekStart)!,
          date,
          title: taskTemplate.title,
          status: 'pending',
          seriesId,
        }
        if (taskTemplate.timeStart) t.timeStart = taskTemplate.timeStart
        if (taskTemplate.timeEnd) t.timeEnd = taskTemplate.timeEnd
        if (taskTemplate.category) t.category = taskTemplate.category
        return t
      })

      await db.tasks.bulkAdd(tasks)

      return seriesId
    })
  },

  async deleteRecurringTasks(task: Task, scope: DeleteScope): Promise<void> {
    if (!task.seriesId) {
      await db.tasks.delete(task.id)
      return
    }

    const seriesId = task.seriesId

    if (scope === 'only') {
      await db.tasks.delete(task.id)
    } else if (scope === 'following') {
      await db.transaction('rw', [db.tasks], async () => {
        const toDelete = await db.tasks
          .where('seriesId')
          .equals(seriesId)
          .filter(t => t.date >= task.date)
          .primaryKeys()
        await db.tasks.bulkDelete(toDelete)
      })
    } else {
      await db.transaction('rw', [db.tasks, db.recurringTaskSeries], async () => {
        await db.tasks.where('seriesId').equals(seriesId).delete()
        await db.recurringTaskSeries.delete(seriesId)
      })
    }
  },
}
