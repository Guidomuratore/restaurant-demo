import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom
import { CartService } from '../../services/cart';
import { WhatsAppService } from '../../services/whatsapp';
import { MercadoPagoService } from '../../services/mercadopago.service';
import { MenuService } from '../../services/menu.service'; // Import MenuService
import { CartItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);
  whatsappService = inject(WhatsAppService);
  mpService = inject(MercadoPagoService);
  menuService = inject(MenuService); // Inject MenuService
  router = inject(Router);

  // Checkout State
  step: 'cart' | 'checkout' = 'cart';
  deliveryMethod: 'delivery' | 'takeaway' = 'delivery';
  paymentMethod: 'mercadopago' | 'cash' = 'mercadopago'; // Default to MP

  // Customer Data
  customer = {
    name: '',
    phone: '',
    address: '',
    notes: ''
  };

  // Validation Errors
  errors: any = {};
  isLoadingMp = false;

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  close() {
    this.cartService.toggleCart();
    this.step = 'cart'; // Reset on close
  }

  goToMenu() {
    this.close();
    this.router.navigate(['/menu']);
  }

  // --- Checkout Flow ---

  proceedToCheckout() {
    this.step = 'checkout';
  }

  backToCart() {
    this.step = 'cart';
  }

  setDeliveryMethod(method: 'delivery' | 'takeaway') {
    this.deliveryMethod = method;
  }

  selectPaymentMethod(method: 'mercadopago' | 'cash') {
    this.paymentMethod = method;
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.customer.name.trim()) {
      this.errors.name = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!this.customer.phone.trim()) {
      this.errors.phone = 'El teléfono es obligatorio';
      isValid = false;
    }

    if (this.deliveryMethod === 'delivery' && !this.customer.address.trim()) {
      this.errors.address = 'La dirección es obligatoria para envíos';
      isValid = false;
    }

    return isValid;
  }

  async submitOrder() {
    if (!this.validateForm()) return;

    // Validate Stock before proceeding
    const isStockValid = await this.validateStock();
    if (!isStockValid) return;

    if (this.paymentMethod === 'mercadopago') {
      await this.payWithMercadoPago();
    } else {
      this.sendViaWhatsApp();
    }
  }

  async validateStock(): Promise<boolean> {
    this.isLoadingMp = true; // reusing loader or add new one? reused for now
    try {
      const freshMenu = await firstValueFrom(this.menuService.getMenu());
      const cartItems = this.cartService.cartItems();
      const invalidItems: string[] = [];

      for (const cartItem of cartItems) {
        // Check if item exists in fresh menu (which only contains available items)
        const exists = freshMenu.some(item => item.id === cartItem.id);
        if (!exists) {
          invalidItems.push(cartItem.name);
        }
      }

      if (invalidItems.length > 0) {
        alert(`⚠️ Lo sentimos, los siguientes productos ya no están disponibles:\n\n- ${invalidItems.join('\n- ')}\n\nPor favor, quítalos del carrito para continuar.`);
        this.isLoadingMp = false;
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating stock:', error);
      alert('Hubo un error verificando la disponibilidad de los productos. Por favor intenta nuevamente.');
      this.isLoadingMp = false;
      return false;
    }
  }

  // --- Payment Methods ---

  async payWithMercadoPago() {
    this.isLoadingMp = true;

    // Create Metadata including Delivery Info
    const orderData = {
      items: this.cartService.cartItems(),
      total: this.cartService.totalPrice(),
      payer: {
        name: this.customer.name,
        phone: this.customer.phone,
        address: this.deliveryMethod === 'delivery' ? this.customer.address : 'Retiro en Local',
        deliveryType: this.deliveryMethod
      }
    };

    try {
      // Returns URL (string) or ID (string) or null
      const result = await this.mpService.createPreference(orderData);

      if (result && result.startsWith('http')) {
        this.mpService.createCheckout(result);
        // Do NOT set isLoadingMp = false here, we are redirecting
      } else if (result) {
        // It's an ID, using modal
        this.isLoadingMp = false;
        this.mpService.createCheckout(result);
      } else {
        // Failed
        this.isLoadingMp = false;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      this.isLoadingMp = false;
    }
  }

  sendViaWhatsApp() {
    // Construct simplified message for Cash
    let message = `*¡Hola! Quiero confirmar mi pedido (Efectivo)* 💵\n\n`;

    // 1. Items
    message += `*Pedido:*\n`;
    this.cartService.cartItems().forEach(item => {
      message += `• ${item.quantity}x ${item.name}`;
      if (item.selectedExtras?.length) message += ` (+${item.selectedExtras.map(e => e.name).join(', ')})`;
      if (item.removedIngredients?.length) message += ` (Sin: ${item.removedIngredients.join(', ')})`;
      if (item.notes) message += ` _"${item.notes}"_`;
      message += `\n`;
    });

    // 2. Total
    message += `\n*Total: $${this.cartService.totalPrice()}*\n`;

    // 3. User & Delivery Info
    message += `\n------------------\n`;
    message += `*Datos de Entrega:*\n`;
    message += `👤 Nombre: ${this.customer.name}\n`;
    message += `📱 Teléfono: ${this.customer.phone}\n`;

    if (this.deliveryMethod === 'delivery') {
      message += `🛵 *Envío a Domicilio*\n`;
      message += `📍 Dirección: ${this.customer.address}\n`;
      if (this.customer.notes) message += `📝 Notas: ${this.customer.notes}\n`;
    } else {
      message += `🛍️ *Retiro en Local*\n`;
    }

    message += `\n*Forma de Pago:* Efectivo 💵`;

    const url = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    this.close(); // Close cart after sending
  }

  // --- Helpers ---

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
