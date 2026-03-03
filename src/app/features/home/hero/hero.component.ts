import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-hero-component',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {

}
