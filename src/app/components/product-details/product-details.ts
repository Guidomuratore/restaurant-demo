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
    this.displayIngredients = this.item.ingredients || ['Lechuga', 'Tomate', 'Cebolla', 'Salsa Especial'];

    this.displayExtras = this.item.extras || [
      { name: 'Extra Cheddar', price: 1500 },
      { name: 'Bacon', price: 2000 },
      { name: 'Huevo Frito', price: 1200 }
    ];
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

  addToCart() {
    this.cartService.addToCart(
      this.item,
      this.quantity,
      this.notes,
      this.selectedExtras,
      this.removedIngredients
    );
    this.close.emit();
  }

  getTotalPrice(): number {
    const extrasTotal = this.selectedExtras.reduce((acc, extra) => acc + extra.price, 0);
    return (this.item.price + extrasTotal) * this.quantity;
  }
}
