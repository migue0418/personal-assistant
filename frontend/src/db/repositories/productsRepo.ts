// frontend/src/db/repositories/productsRepo.ts
import { db } from '../database'
import type { Product } from '@/features/products/types'

export const productsRepo = {
  getAllProducts: (): Promise<Product[]> => db.products.orderBy('name').toArray(),

  searchProducts: (query: string): Promise<Product[]> => {
    const q = query.toLowerCase()
    return db.products.filter(p => p.name.toLowerCase().includes(q)).toArray()
  },

  createProduct: (product: Omit<Product, 'id'>): Promise<number> =>
    db.products.add(product) as Promise<number>,

  updateProduct: (id: number, changes: Partial<Product>): Promise<void> =>
    db.products.update(id, changes).then(() => undefined),

  deleteProduct: (id: number): Promise<void> => db.products.delete(id),

  isProductInUse: async (id: number): Promise<boolean> => {
    const count = await db.shoppingItems.where('productId').equals(id).count()
    return count > 0
  },
}
