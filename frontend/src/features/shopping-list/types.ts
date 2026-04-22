export interface ShoppingList {
  id?: number
  createdAt: string
}

export interface ShoppingItem {
  id?: number
  listId: number
  category: string
  checked: boolean
}
