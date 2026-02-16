import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { MenuListComponent } from './components/menu-list/menu-list';
import { CartBubbleComponent } from './components/cart-bubble/cart-bubble';
import { Footer } from './components/footer/footer';
import { OrderSummaryComponent } from './components/order-summary/order-summary';
import { CartService } from './services/cart';
import { WhatsAppButtonComponent } from './components/whatsapp-button/whatsapp-button';
import { ScrollTopComponent } from './components/scroll-top/scroll-top';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, CartBubbleComponent, Footer, OrderSummaryComponent, WhatsAppButtonComponent, ScrollTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  title = 'restaurant-demo';
  cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Logic removed to avoid native alerts. 
      // Payment feedback is handled by PaymentResultComponent.
    });
  }
}
