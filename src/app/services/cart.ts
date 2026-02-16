import { Injectable, computed, signal } from '@angular/core';
import { CartItem, MenuItem, MenuExtra } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);
  isOpen = signal<boolean>(false);

  totalItems = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0));

  addToCart(product: MenuItem, quantity: number = 1, notes: string = '', extras: MenuExtra[] = [], removedIngredients: string[] = []) {
    this.cartItems.update(items => {
      // Create a unique ID for this cart item based on its ID and customizations
      // Simpler approach: Just always add a new item for customization, or check deep equality.
      // For this demo, let's treat every addition as unique if it has customizations.
      // If no customizations, we can stack them.

      const isCustomized = notes || extras.length > 0 || removedIngredients.length > 0;

      if (!isCustomized) {
        const existingItem = items.find(item => item.id === product.id && !item.uuid);
        if (existingItem) {
          return items.map(item =>
            item.id === product.id && !item.uuid ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
      }

      const newItem: CartItem = {
        ...product,
        quantity,
        notes,
        selectedExtras: extras,
        removedIngredients,
        uuid: isCustomized ? crypto.randomUUID() : undefined
      };

      return [...items, newItem];
    });
  }

  removeFromCart(index: number) {
    this.cartItems.update(items => items.filter((_, i) => i !== index));
  }

  // Updated to use index or unique ID
  incrementQuantity(index: number) {
    this.cartItems.update(items => items.map((item, i) =>
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    ));
  }

  decrementQuantity(index: number) {
    this.cartItems.update(items => {
      const updatedItems = items.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity - 1 } : item
      );
      return updatedItems.filter(item => item.quantity > 0);
    });
  }

  getItemQuantity(productId: string): number {
    return this.cartItems()
      .filter(item => item.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  }

  clearCart() {
    this.cartItems.set([]);
  }

  toggleCart() {
    this.isOpen.update(open => !open);
  }
}
