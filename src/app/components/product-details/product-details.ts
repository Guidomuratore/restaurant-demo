import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem, MenuExtra } from '../../models/menu-item.model';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetailsComponent implements OnInit {
  @Input({ required: true }) item!: MenuItem;
  @Input() mode: 'add' | 'edit' = 'add'; // New Input
  @Input() cartItem: any = null; // New Input (Typed as any or CartItem if imported)
  @Input() cartIndex: number = -1; // New Input

  @Output() close = new EventEmitter<void>();

  cartService = inject(CartService);

  quantity = 1;
  notes = '';
  selectedExtras: MenuExtra[] = [];
  removedIngredients: string[] = [];

  // Stable arrays to prevent *ngFor re-rendering
  displayIngredients: string[] = [];
  displayExtras: MenuExtra[] = [];

  ngOnInit() {
    this.displayIngredients = this.item.ingredients && this.item.ingredients.length > 0
      ? this.item.ingredients
      : [];

    this.displayExtras = this.item.extras && this.item.extras.length > 0
      ? this.item.extras
      : [];

    // Pre-fill if in Edit Mode
    if (this.mode === 'edit' && this.cartItem) {
      this.quantity = this.cartItem.quantity || 1;
      this.notes = this.cartItem.notes || '';
      // Clone arrays to avoid reference issues
      this.selectedExtras = [...(this.cartItem.selectedExtras || [])];
      this.removedIngredients = [...(this.cartItem.removedIngredients || [])];
    }
  }

  isIngredientRemoved(ing: string): boolean {
    return this.removedIngredients.includes(ing);
  }

  isExtraSelected(extra: MenuExtra): boolean {
    return this.selectedExtras.some(e => e.name === extra.name);
  }

  toggleIngredient(ingredient: string, event: any) {
    if (!event.target.checked) {
      this.removedIngredients.push(ingredient);
    } else {
      this.removedIngredients = this.removedIngredients.filter(i => i !== ingredient);
    }
  }

  toggleExtra(extra: MenuExtra, event: any) {
    if (event.target.checked) {
      this.selectedExtras.push(extra);
    } else {
      this.selectedExtras = this.selectedExtras.filter(e => e.name !== extra.name);
    }
  }

  increment() { this.quantity++; }
  decrement() { if (this.quantity > 1) this.quantity--; }

  save() {
    if (this.mode === 'edit' && this.cartIndex >= 0) {
      this.cartService.updateItem(this.cartIndex, {
        quantity: this.quantity,
        notes: this.notes,
        selectedExtras: this.selectedExtras,
        removedIngredients: this.removedIngredients
      });
    } else {
      this.cartService.addToCart(
        this.item,
        this.quantity,
        this.notes,
        this.selectedExtras,
        this.removedIngredients
      );
    }
    this.close.emit();
  }

  getTotalPrice(): number {
    const extrasTotal = this.selectedExtras.reduce((acc, extra) => acc + extra.price, 0);
    return (this.item.price + extrasTotal) * this.quantity;
  }
}
