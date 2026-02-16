import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { MenuListComponent } from './components/menu-list/menu-list';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'menu', component: MenuListComponent },
    // Payment Redirects: Handle n8n back_urls by redirecting to Home where logic lives
    { path: 'pago-exitoso', redirectTo: '' },
    { path: 'pago-fallido', redirectTo: '' },
    { path: 'pago-pendiente', redirectTo: '' },
    { path: '**', redirectTo: '' }
];
