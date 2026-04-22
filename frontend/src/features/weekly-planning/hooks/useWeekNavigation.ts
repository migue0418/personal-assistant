import { useState, useMemo, useCallback } from 'react'

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMondayOf(date: Date): string {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function useWeekNavigation() {
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()))

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const goToPrevWeek = useCallback(() => setWeekStart(s => addDays(s, -7)), [])
  const goToNextWeek = useCallback(() => setWeekStart(s => addDays(s, 7)), [])
  const goToCurrentWeek = useCallback(() => setWeekStart(getMondayOf(new Date())), [])

  return {
    weekStart,
    weekDates,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  }
}
