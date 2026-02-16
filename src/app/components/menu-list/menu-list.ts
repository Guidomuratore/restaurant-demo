import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item';
import { ProductDetailsComponent } from '../product-details/product-details';
import { MenuItem } from '../../models/menu-item.model';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, MenuItemComponent, ProductDetailsComponent],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.scss',
  styles: `
    :host {
      display: block;
    }
  `
})
export class MenuListComponent implements AfterViewInit, OnDestroy {
  items: MenuItem[] = [
    // Burgers
    {
      id: '1',
      name: 'Hamburguesa Premium',
      description: 'Doble carne, cheddar, bacon y salsa especial.',
      price: 12500,
      category: 'Hamburguesas',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '101',
      name: 'Cheeseburger Clásica',
      description: 'Carne smasheada, doble cheddar, cebolla picada y mostaza.',
      price: 9500,
      category: 'Hamburguesas',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60'
    },
    // Pizzas
    {
      id: '2',
      name: 'Pizza Napolitana',
      description: 'Salsa de tomate, mozzarella fior di latte, albahaca fresca.',
      price: 10800,
      category: 'Pizzas',
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '201',
      name: 'Pizza Pepperoni',
      description: 'Mozzarella generosa y rodajas de pepperoni picante.',
      price: 11500,
      category: 'Pizzas',
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60'
    },
    // Ensaladas
    {
      id: '3',
      name: 'Ensalada Caesar',
      description: 'Lechuga romana, croutones, parmesano y aderezo casero.',
      price: 8500,
      category: 'Ensaladas',
      imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60'
    },
    // Acompañantes
    {
      id: '4',
      name: 'Papas Fritas XL',
      description: 'Porción gigante con cheddar, panceta y verdeo.',
      price: 6000,
      category: 'Acompañantes',
      imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '401',
      name: 'Aros de Cebolla',
      description: 'Crocantes, servidos con salsa barbacoa.',
      price: 5500,
      category: 'Acompañantes',
      imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=500&q=60'
    },
    // Bebidas
    {
      id: '501',
      name: 'Cerveza Artesanal IPA',
      description: 'Pinta 500ml. Lupulada y refrescante.',
      price: 4500,
      category: 'Bebidas',
      imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '502',
      name: 'Limonada con Menta',
      description: 'Jarra de 1 litro. Fresca y natural.',
      price: 3500,
      category: 'Bebidas',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60'
    },
    // Postres
    {
      id: '601',
      name: 'Cheesecake de Frutos Rojos',
      description: 'Cremoso y suave, con salsa casera.',
      price: 5200,
      category: 'Postres',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '602',
      name: 'Volcán de Chocolate',
      description: 'Servido tibio con una bocha de helado de americana.',
      price: 5800,
      category: 'Postres',
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=60'
    }
  ];

  selectedCategory = 'Hamburguesas';
  categories = ['Hamburguesas', 'Pizzas', 'Ensaladas', 'Acompañantes', 'Bebidas', 'Postres'];
  selectedItem: MenuItem | null = null;
  private observer: IntersectionObserver | null = null;
  private isClicked = false; // Prevent spy update on click scroll

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private setupIntersectionObserver() {
    // Options to detect when a section is substantially in view
    const options = {
      root: null,
      rootMargin: '-100px 0px -60% 0px', // Trigger when section is near top but not passed
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      // Don't update if we are scrolling due to a click
      if (this.isClicked) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Run inside NgZone to ensure UI update
          this.ngZone.run(() => {
            this.selectedCategory = entry.target.id;
            this.scrollNavToCategory(this.selectedCategory);
          });
        }
      });
    }, options);

    this.categories.forEach(cat => {
      const element = document.getElementById(cat);
      if (element) this.observer?.observe(element);
    });
  }

  private scrollNavToCategory(category: string) {
    // Find the button for this category
    const buttons = document.querySelectorAll('.category-nav button');
    let targetButton: HTMLElement | null = null;

    buttons.forEach((btn: any) => {
      if (btn.textContent.trim() === category) {
        targetButton = btn;
      }
    });

    if (targetButton) {
      (targetButton as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  scrollToCategory(category: string) {
    this.isClicked = true;
    this.selectedCategory = category;

    // Also scroll the nav button into view
    this.scrollNavToCategory(category);

    const element = document.getElementById(category);
    if (element) {
      const headerOffset = 150; // Adjust for sticky header/nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Re-enable spy after scroll animation (approx 1s)
      setTimeout(() => {
        this.isClicked = false;
      }, 1000);
    } // If element not found, we should still perform default logic or nothing? 
    // Original logic was just if(element).
  }

  // Helper to get items for a category
  getItemsByCategory(category: string): MenuItem[] {
    return this.items.filter(item => item.category === category);
  }

  openProductDetails(item: MenuItem) {
    this.selectedItem = item;
  }

  closeProductDetails() {
    this.selectedItem = null;
  }
}
