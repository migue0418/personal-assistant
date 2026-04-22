import { create } from 'zustand'

interface UIStore {
  selectedDate: string
  setSelectedDate: (date: string) => void
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>(set => ({
  selectedDate: new Date().toISOString().substring(0, 10),
  setSelectedDate: date => set({ selectedDate: date }),
  isSidebarOpen: false,
  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),
}))
