// frontend/src/features/shopping-list/hooks/useShoppingList.ts
import { useState, useEffect, useCallback } from 'react'
import { shoppingRepo } from '@/db/repositories/shoppingRepo'
import type { ShoppingList, ShoppingItem } from '../types'

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      const result = await shoppingRepo.getAllLists()
      if (!cancelled) {
        setLists(result)
        setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [refreshToken])

  const refresh = useCallback(() => setRefreshToken(t => t + 1), [])
  return { lists, isLoading, refresh }
}

export function useShoppingListDetail(listId: number) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      const result = await shoppingRepo.getItemsByList(listId)
      if (!cancelled) {
        setItems(result)
        setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [listId, refreshToken])

  const refresh = useCallback(() => setRefreshToken(t => t + 1), [])
  return { items, isLoading, refresh }
}
