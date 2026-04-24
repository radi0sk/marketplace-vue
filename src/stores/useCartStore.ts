import { defineStore } from 'pinia';
import type { Product, CartItem } from '@/types';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),
  actions: {
    addItem(product: Product) {
      const existingItem = this.items.find(i => i.id === product.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
    },
    removeItem(productId: string) {
      this.items = this.items.filter(i => i.id !== productId);
    },
    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(i => i.id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    clearCart() {
      this.items = [];
    }
  },
  getters: {
    total(): number {
      return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    },
    itemCount(): number {
      return this.items.reduce((acc, item) => acc + item.quantity, 0);
    },
  },
  persist: true,
});
