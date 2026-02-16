import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, NgZone, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item';
import { ProductDetailsComponent } from '../product-details/product-details';
import { MenuItem } from '../../models/menu-item.model';
import { ScrollService } from '../../services/scroll.service';
import { MenuService } from '../../services/menu.service';

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
export class MenuListComponent implements OnInit, AfterViewInit, OnDestroy {
  items: MenuItem[] = [];
  categories: string[] = [];
  selectedCategory = '';
  selectedItem: MenuItem | null = null;
  isLoading = true; // Loading state

  private menuService = inject(MenuService);
  private cdr = inject(ChangeDetectorRef); // Inject CDR
  private observer: IntersectionObserver | null = null;
  private isClicked = false;

  constructor(private ngZone: NgZone) { }

  ngOnInit() {
    this.isLoading = true;
    this.menuService.getMenu().subscribe({
      next: (data) => {
        console.log('MenuList: Received items:', data);
        this.items = data;
        this.categories = [...new Set(data.map(item => item.category))];

        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0];
        }

        this.isLoading = false;
        this.cdr.markForCheck();

        setTimeout(() => this.setupIntersectionObserver(), 100);
      },
      error: (err) => {
        console.error('MenuList: Error fetching menu', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }



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
