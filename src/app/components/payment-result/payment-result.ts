import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CartService } from '../../services/cart';

@Component({
    selector: 'app-payment-result',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './payment-result.html',
    styleUrl: './payment-result.scss'
})
export class PaymentResultComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cartService = inject(CartService);

    // States: 'success' | 'failure' | 'pending' | 'unknown'
    status = signal<string>('unknown');

    // Payment Details
    paymentId = signal<string>('');
    externalReference = signal<string>('');

    // Flag to track if we've seen valid MP params in this session
    private isValidAccess = false;

    ngOnInit() {
        // 1. Determine Status from Route Data (preferred) or URL segments
        const routeData = this.route.snapshot.data;
        if (routeData['state']) {
            this.status.set(routeData['state']);
        } else {
            // Fallback: Check path
            const path = this.route.snapshot.url[0]?.path;
            if (path?.includes('exitoso')) this.status.set('success');
            else if (path?.includes('fallido')) this.status.set('failure');
            else if (path?.includes('pendiente')) this.status.set('pending');
        }

        // 2. Capture Query Params & Validate
        this.route.queryParams.subscribe(params => {
            // Check if we have ANY meaningful MercadoPago param
            const hasMpParams = params['collection_status'] || params['status'] ||
                params['payment_id'] || params['merchant_order_id'] ||
                params['external_reference'] || params['preference_id'];

            if (hasMpParams) {
                this.isValidAccess = true;

                if (params['payment_id']) this.paymentId.set(params['payment_id']);
                if (params['external_reference']) this.externalReference.set(params['external_reference']);

                // Also check 'status' or 'collection_status' param if we didn't get it from route data
                if (this.status() === 'unknown') {
                    const mpStatus = params['status'] || params['collection_status'];
                    if (mpStatus === 'approved') this.status.set('success');
                    else if (mpStatus === 'rejected' || mpStatus === 'null') this.status.set('failure');
                    else if (mpStatus === 'in_process' || mpStatus === 'pending') this.status.set('pending');
                }

                if (this.status() === 'success') {
                    this.cartService.clearCart();
                    localStorage.removeItem('checkout_data');
                }

                // 3. Clean URL (Remove query params)
                // Only do this if we actually have params to clean to avoid infinite loops or weird behaviors
                this.cleanUrl();
            } else if (!this.isValidAccess) {
                // NO params and NOT previously validated -> Direct access or Refresh -> Redirect Home
                this.router.navigate(['/']);
            }
            // If !hasMpParams BUT isValidAccess is true, it means we just cleaned the URL. Do nothing.
        });
    }

    cleanUrl() {
        // Navigate to the same route but without query params
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true // Replaces the history entry so back button doesn't take you to the ugly URL
        });
    }

    retryPayment() {
        this.router.navigate(['/menu'], { queryParams: { openCart: 'true' } });
    }
}
