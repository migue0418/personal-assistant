import { useState, useEffect, useCallback } from 'react'
import { planningRepo } from '@/db/repositories/planningRepo'
import type { Task, WeeklyPlan } from '@/features/weekly-planning/types'

export function useWeeklyPlan(weekStart: string) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[] | undefined>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError(null)
      setPlan(null)
      setTasksByDate({})
      try {
        const p = await planningRepo.getOrCreateWeekPlan(weekStart)
        if (cancelled) return
        const tasks = await planningRepo.getTasksByWeek(p.id)
        if (cancelled) return
        const grouped: Record<string, Task[]> = {}
        for (const task of tasks) {
          const existing = grouped[task.date]
          if (existing) {
            existing.push(task)
          } else {
            grouped[task.date] = [task]
          }
        }
        setPlan(p)
        setTasksByDate(grouped)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [weekStart, refreshToken])

  const refresh = useCallback(() => setRefreshToken(t => t + 1), [])

  return { plan, tasksByDate, isLoading, error, refresh }
}
