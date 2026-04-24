// frontend/src/db/repositories/shoppingRepo.ts
import { db } from '../database'
import type { ShoppingList, ShoppingItem } from '@/features/shopping-list/types'

export const shoppingRepo = {
  getAllLists: (): Promise<ShoppingList[]> =>
    db.shoppingLists.orderBy('createdAt').reverse().toArray(),

  createList: (name: string): Promise<number> =>
    db.shoppingLists.add({ name, createdAt: new Date().toISOString() }) as Promise<number>,

  deleteList: async (id: number): Promise<void> => {
    await db.shoppingItems.where('listId').equals(id).delete()
    await db.shoppingLists.delete(id)
  },

  getItemsByList: (listId: number): Promise<ShoppingItem[]> =>
    db.shoppingItems.where('listId').equals(listId).toArray(),

  addItem: (item: Omit<ShoppingItem, 'id'>): Promise<number> =>
    db.shoppingItems.add(item) as Promise<number>,

  updateItem: (id: number, changes: Partial<ShoppingItem>): Promise<void> =>
    db.shoppingItems.update(id, changes).then(() => undefined),

  deleteItem: (id: number): Promise<void> => db.shoppingItems.delete(id),

  uncheckAllItems: async (listId: number): Promise<void> => {
    const items = await db.shoppingItems.where('listId').equals(listId).toArray()
    await Promise.all(items.map(item => db.shoppingItems.update(item.id, { checked: false })))
  },
}
