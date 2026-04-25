import Dexie, { type EntityTable } from 'dexie'
import type {
  WeeklyPlan,
  Task,
  RecurringTaskSeries,
  TaskReminder,
} from '@/features/weekly-planning/types'
import type { Habit, HabitLog } from '@/features/habits/types'
import type { Recipe } from '@/features/recipes/types'
import type { ShoppingList, ShoppingItem } from '@/features/shopping-list/types'
import type { Product } from '@/features/products/types'
import type { WorkoutSession, Exercise } from '@/features/workout/types'

export const db = new Dexie('personal-assistant') as Dexie & {
  weeklyPlans: EntityTable<WeeklyPlan, 'id'>
  tasks: EntityTable<Task, 'id'>
  recurringTaskSeries: EntityTable<RecurringTaskSeries, 'id'>
  habits: EntityTable<Habit, 'id'>
  habitLogs: EntityTable<HabitLog, 'id'>
  recipes: EntityTable<Recipe, 'id'>
  shoppingLists: EntityTable<ShoppingList, 'id'>
  shoppingItems: EntityTable<ShoppingItem, 'id'>
  workoutSessions: EntityTable<WorkoutSession, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  products: EntityTable<Product, 'id'>
  taskReminders: EntityTable<TaskReminder, 'id'>
}

db.version(1).stores({
  weeklyPlans: '++id, weekStart',
  tasks: '++id, planId, date, status',
  habits: '++id, name, frequency',
  habitLogs: '++id, habitId, date',
  recipes: '++id, name, category',
  shoppingLists: '++id, createdAt',
  shoppingItems: '++id, listId, category, checked',
  workoutSessions: '++id, date',
  exercises: '++id, name, muscleGroup',
})

db.version(2).stores({
  weeklyPlans: '++id, weekStart',
  tasks: '++id, planId, date, status, seriesId',
  recurringTaskSeries: '++id',
  habits: '++id, name, frequency',
  habitLogs: '++id, habitId, date',
  recipes: '++id, name, category',
  shoppingLists: '++id, createdAt',
  shoppingItems: '++id, listId, category, checked',
  workoutSessions: '++id, date',
  exercises: '++id, name, muscleGroup',
})

db.version(3).stores({
  weeklyPlans: '++id, weekStart',
  tasks: '++id, planId, date, status, seriesId',
  recurringTaskSeries: '++id',
  habits: '++id, name, frequency',
  habitLogs: '++id, habitId, date',
  recipes: '++id, name, category',
  shoppingLists: '++id, createdAt',
  shoppingItems: '++id, listId, category, checked, productId',
  workoutSessions: '++id, date',
  exercises: '++id, name, muscleGroup',
  products: '++id, name, category',
})

db.version(4).stores({
  weeklyPlans: '++id, weekStart',
  tasks: '++id, planId, date, status, seriesId',
  recurringTaskSeries: '++id',
  habits: '++id, name, frequency',
  habitLogs: '++id, habitId, date',
  recipes: '++id, name, category',
  shoppingLists: '++id, createdAt',
  shoppingItems: '++id, listId, category, checked, productId',
  workoutSessions: '++id, date',
  exercises: '++id, name, muscleGroup',
  products: '++id, name, category',
  taskReminders: '++id, taskId, scheduledAt, fired',
})
