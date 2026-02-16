import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { MenuListComponent } from './components/menu-list/menu-list';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'menu', component: MenuListComponent },
    // Payment Redirects: specific component to handle UI and URL cleaning
    {
        path: 'pago-exitoso',
        loadComponent: () => import('./components/payment-result/payment-result').then(m => m.PaymentResultComponent),
        data: { state: 'success' }
    },
    {
        path: 'pago-fallido',
        loadComponent: () => import('./components/payment-result/payment-result').then(m => m.PaymentResultComponent),
        data: { state: 'failure' }
    },
    {
        path: 'pago-pendiente',
        loadComponent: () => import('./components/payment-result/payment-result').then(m => m.PaymentResultComponent),
        data: { state: 'pending' }
    },
    { path: '**', redirectTo: '' }
];
