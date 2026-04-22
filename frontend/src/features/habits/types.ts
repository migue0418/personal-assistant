export interface Habit {
  id?: number
  name: string
  frequency: string
}

export interface HabitLog {
  id?: number
  habitId: number
  date: string
}
