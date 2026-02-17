import { Injectable, computed, signal } from '@angular/core';
import { CartItem, MenuItem, MenuExtra } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);
  isOpen = signal<boolean>(false);

  totalItems = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((acc, item) => {
    const extras = item.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
    return acc + ((item.price + extras) * item.quantity);
  }, 0));

  constructor() {
    this.loadFromStorage();
  }

  // ... (computed signals)

  addToCart(product: MenuItem, quantity: number = 1, notes: string = '', extras: MenuExtra[] = [], removedIngredients: string[] = []) {
    this.cartItems.update(items => {
      // Always create a new item for every addition to allow individual editing.
      // We generate a UUID for every single item.

      const newItem: CartItem = {
        ...product,
        quantity,
        notes,
        selectedExtras: extras,
        removedIngredients,
        uuid: crypto.randomUUID()
      };

      const newItems = [...items, newItem];
      this.saveToStorage(newItems);
      return newItems;
    });
  }

  updateItem(index: number, updates: Partial<CartItem>) {
    this.cartItems.update(items => {
      const newItems = items.map((item, i) => i === index ? { ...item, ...updates } : item);
      this.saveToStorage(newItems);
      return newItems;
    });
  }

  removeFromCart(index: number) {
    this.cartItems.update(items => {
      const newItems = items.filter((_, i) => i !== index);
      this.saveToStorage(newItems);
      return newItems;
    });
  }

  incrementQuantity(index: number) {
    this.cartItems.update(items => {
      const newItems = items.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item
      );
      this.saveToStorage(newItems);
      return newItems;
    });
  }

  decrementQuantity(index: number) {
    this.cartItems.update(items => {
      const updatedItems = items.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity - 1 } : item
      );
      const newItems = updatedItems.filter(item => item.quantity > 0);
      this.saveToStorage(newItems);
      return newItems;
    });
  }

  // ... (getItemQuantity)

  clearCart() {
    this.cartItems.set([]);
    this.saveToStorage([]);
  }

  private saveToStorage(items: CartItem[]) {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('cart_items');
    if (stored) {
      try {
        this.cartItems.set(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading cart from storage', e);
      }
    }
  }

  // Methods are already defined above with persistence logic.
  // Removing duplicate old implementations.

  getItemQuantity(productId: string): number {
    return this.cartItems()
      .filter(item => item.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  }

  toggleCart() {
    this.isOpen.update(open => !open);
  }
}
