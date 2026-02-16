import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { WhatsAppService } from '../../services/whatsapp';

@Component({
  selector: 'app-cart-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-bubble.html',
  styleUrl: './cart-bubble.scss',
})
export class CartBubbleComponent {
  cartService = inject(CartService);
  whatsappService = inject(WhatsAppService);

  toggleCart() {
    this.cartService.toggleCart();
  }
}
