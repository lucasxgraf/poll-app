import { Component } from '@angular/core';
import { HeaderComponent } from "../../../core/layout/header/header";
import { ButtonComponent } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-hero-component',
  standalone: true,
  imports: [HeaderComponent, ButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {

}
