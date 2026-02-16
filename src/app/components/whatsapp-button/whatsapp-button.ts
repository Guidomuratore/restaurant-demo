import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  template: `
    <a href="https://wa.me/5491112345678?text=Hola,%20quisiera%20saber%20qu%C3%A9%20m%C3%A1s%20tienen%20del%20Menu?" target="_blank" class="whatsapp-float">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
      <span class="tooltip">¿Consultas?</span>
    </a>
  `,
  styles: [`
    .whatsapp-float {
      position: fixed;
      bottom: 20px; // Back to bottom corner
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: #25d366;
      color: #FFF;
      border-radius: 50px;
      text-align: center;
      font-size: 30px;
      box-shadow: 2px 2px 3px #999;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
        background-color: #20ba5a;
      }

      img {
        width: 35px;
        height: 35px;
      }

      .tooltip {
        position: absolute;
        right: 70px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
      }

      &:hover .tooltip {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
        .whatsapp-float {
            width: 50px;
            height: 50px;
            bottom: 20px;
            
            img {
                width: 28px;
                height: 28px;
            }
        }
    }
  `]
})
export class WhatsAppButtonComponent { }
