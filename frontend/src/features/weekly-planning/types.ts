export interface WeeklyPlan {
  id: number
  weekStart: string
  notes?: string
}

export interface Task {
  id: number
  planId: number
  date: string
  title: string
  status: 'pending' | 'done' | 'skipped'
  timeStart?: string
  timeEnd?: string
  category?: TaskCategory
  seriesId?: number
}

export type TaskCategory = 'work' | 'personal' | 'health' | 'shopping' | 'other'

export type RecurrenceFrequency = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom'

export type RecurrenceEndCondition =
  | { type: 'date'; until: string }
  | { type: 'count'; times: number }

export interface RecurringTaskSeries {
  id?: number
  frequency: RecurrenceFrequency
  customDays?: number[] // 0=Dom, 1=Lun, ..., 6=Sáb — solo cuando frequency === 'custom'
  endCondition: RecurrenceEndCondition
  templateTitle: string
  templateTimeStart?: string
  templateTimeEnd?: string
  templateCategory?: TaskCategory
}

export type DeleteScope = 'only' | 'following' | 'all'

export type ReminderOffset = 10 | 60 | 1440 | 10080

export interface TaskReminder {
  id: number
  taskId: number
  taskTitle: string
  scheduledAt: string
  minutesBefore: ReminderOffset
  fired: 0 | 1
}
