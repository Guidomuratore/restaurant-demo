import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { WhatsAppService } from '../../services/whatsapp';
import { MercadoPagoService } from '../../services/mercadopago.service';
import { CartItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
})
export class OrderSummaryComponent {
  cartService = inject(CartService);
  whatsappService = inject(WhatsAppService);
  mpService = inject(MercadoPagoService);

  close() {
    this.cartService.toggleCart();
  }

  confirmOrder() {
    const link = this.whatsappService.generateWhatsAppLink(this.cartService.cartItems());
    window.open(link, '_blank');
  }

  isLoadingMp = false;

  async payWithMercadoPago() {
    this.isLoadingMp = true;
    const orderData = {
      items: this.cartService.cartItems(),
      total: this.cartService.totalPrice()
    };

    // Returns URL (string) or ID (string) or null
    const result = await this.mpService.createPreference(orderData);

    // Only reset loading if we FAILED or if it's the modal flow (ID).
    // If it's a URL, we are redirecting, so keep loading true to prevent double clicks.
    if (result && result.startsWith('http')) {
      this.mpService.createCheckout(result);
      // Do NOT set isLoadingMp = false here
    } else if (result) {
      // It's an ID, using modal
      this.isLoadingMp = false;
      this.mpService.createCheckout(result);
    } else {
      // Failed
      this.isLoadingMp = false;
    }
  }

  increment(index: number) {
    this.cartService.incrementQuantity(index);
  }

  decrement(index: number) {
    this.cartService.decrementQuantity(index);
  }

  remove(index: number) {
    this.cartService.removeFromCart(index);
  }

  getItemTotal(item: CartItem): number {
    const extras = item.selectedExtras?.reduce((acc, extra) => acc + extra.price, 0) || 0;
    return (item.price + extras) * item.quantity;
  }

  getExtrasNames(item: CartItem): string {
    return item.selectedExtras?.map(e => e.name).join(', ') || '';
  }

  getRemovedIngredients(item: CartItem): string {
    return item.removedIngredients?.join(', ') || '';
  }
}
