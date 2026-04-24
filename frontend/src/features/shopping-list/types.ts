// frontend/src/features/shopping-list/types.ts
export interface ShoppingList {
  id?: number
  name: string
  createdAt: string
}

export interface ShoppingItem {
  id?: number
  listId: number
  productId?: number
  name: string
  price?: number
  quantity: number
  category?: string
  checked: boolean
}
