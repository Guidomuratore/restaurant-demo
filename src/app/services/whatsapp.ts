import { Injectable } from '@angular/core';
import { CartItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {

  generateWhatsAppLink(cartItems: CartItem[]): string {
    const phoneNumber = '5491112345678'; // Replace with restaurant number
    let message = 'Hola! Quisiera realizar el siguiente pedido:\n\n';

    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} ($${(item.price + (item.selectedExtras?.reduce((a, b) => a + b.price, 0) || 0)) * item.quantity})\n`;
      if (item.selectedExtras && item.selectedExtras.length > 0) {
        message += `  + Extras: ${item.selectedExtras.map(e => e.name).join(', ')}\n`;
      }
      if (item.removedIngredients && item.removedIngredients.length > 0) {
        message += `  - Sin: ${item.removedIngredients.join(', ')}\n`;
      }
      if (item.notes) {
        message += `  * Nota: ${item.notes}\n`;
      }
    });

    const total = cartItems.reduce((acc, item) => acc + ((item.price + (item.selectedExtras?.reduce((a, b) => a + b.price, 0) || 0)) * item.quantity), 0);
    message += `\n*Total: $${total}*`;
    message += `\n\nGracias!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }
}
