import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-scroll-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class.show]="isVisible" 
      (click)="scrollToTop()" 
      class="scroll-top-btn" 
      aria-label="Volver arriba">
      ⬆
    </button>
  `,
  styles: [`
    .scroll-top-btn {
      position: fixed;
      bottom: 90px; // Above WhatsApp (20px + 60px + 10px margin)
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      z-index: 990;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;

      &.show {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }

      &:hover {
        background: var(--secondary-color);
        transform: translateY(-3px);
      }
    }

    @media (max-width: 768px) {
        .scroll-top-btn {
            width: 45px;
            height: 45px;
            bottom: 80px;
            right: 20px;
        }
    }
  `]
})
export class ScrollTopComponent {
  isVisible = false;

  constructor(private scrollService: ScrollService) { }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isVisible = window.scrollY > 300;
  }

  scrollToTop() {
    this.scrollService.setScrolling(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset after animation (approx)
    setTimeout(() => {
      this.scrollService.setScrolling(false);
    }, 1000);
  }
}
