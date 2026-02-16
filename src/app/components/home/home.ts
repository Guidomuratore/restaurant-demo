import { Component } from '@angular/core';
import { Hero } from '../hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero],
  template: `<app-hero></app-hero>`,
  styles: ``
})
export class HomeComponent { }
