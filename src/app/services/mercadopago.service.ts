import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

declare const MercadoPago: any;

@Injectable({
    providedIn: 'root'
})
export class MercadoPagoService {
    private mp: any;
    private http = inject(HttpClient);
    private n8nWebhookUrl = environment.n8nWebhookUrl;

    constructor() {
        this.init();
    }

    private init() {
        // Init with key from environment
        this.mp = new MercadoPago(environment.mpPublicKey, {
            locale: 'es-AR'
        });
    }

    async createPreference(orderData: any): Promise<string | null> {
        try {
            console.log('Enviando datos a pago:', orderData);

            console.log('Enviando datos a pago:', orderData);
            const response: any = await firstValueFrom(this.http.post(this.n8nWebhookUrl, orderData));
            console.log('Respuesta del servidor de pago:', response);

            if (!response) {
                throw new Error('La respuesta del servidor fue vacía (null). Verifica el Webhook de n8n.');
            }

            // We prefer the 'sandbox_init_point' for testing purposes.
            // If not available, we fall back to 'init_point'.
            const redirectUrl = response.sandbox_init_point || response.init_point;

            if (redirectUrl) {
                return redirectUrl;
            }

            // Fallback: If only ID is returned, we can try to construct the URL manually or return ID
            const prefId = response.preferenceId || response.id;

            if (prefId) {
                // If we want to force redirect with just ID, we might need the URL structure
                // But usually n8n/MP API returns the init_point.
                // If we return ID here, ensure createCheckout handles it or we fail gracefully.
                return prefId;
            }

            return null;
        } catch (error) {
            console.error('Error creating preference:', error);
            const err = error as any;
            const msg = err.error?.message || err.message || 'Error desconocido';
            alert(`Error al conectar con el servidor de pago: ${msg}`);
            return null;
        }
    }

    createCheckout(urlOrId: string) {
        if (!urlOrId) return;

        // Check if it looks like a URL
        if (urlOrId.startsWith('http')) {
            window.location.href = urlOrId;
        } else {
            // Fallback to modal if it's just an ID
            if (this.mp) {
                this.mp.checkout({
                    preference: {
                        id: urlOrId
                    },
                    autoOpen: true,
                });
            }
        }
    }

    simulateCheckout() {
        // Legacy method, keeping for reference or fallback
        alert('Simulación: Redirigiendo a MercadoPago (Checkout Pro).');
    }
}
