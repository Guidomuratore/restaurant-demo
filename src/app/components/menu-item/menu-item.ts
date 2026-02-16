import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for pipes like currency
import { MenuItem } from '../../models/menu-item.model';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.scss',
})
export class MenuItemComponent {
  @Input({ required: true }) item!: MenuItem;
  @Output() selected = new EventEmitter<MenuItem>();

  cartService = inject(CartService);

  quantity = computed(() => this.cartService.getItemQuantity(this.item.id));

  // Opens modal for customization
  openDetails() {
    this.selected.emit(this.item);
  }

  // Direct add to cart (default behavior)
  addToCart() {
    this.cartService.addToCart(this.item);
  }
}
