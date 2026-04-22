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
}

export type TaskCategory =
  | 'work'
  | 'personal'
  | 'health'
  | 'shopping'
  | 'other'
