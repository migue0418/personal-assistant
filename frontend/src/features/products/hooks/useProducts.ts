// frontend/src/features/products/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react'
import { productsRepo } from '@/db/repositories/productsRepo'
import type { Product } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      const result = await productsRepo.getAllProducts()
      if (!cancelled) {
        setProducts(result)
        setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [refreshToken])

  const refresh = useCallback(() => setRefreshToken(t => t + 1), [])
  return { products, isLoading, refresh }
}
