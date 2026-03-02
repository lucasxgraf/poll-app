import { Component } from '@angular/core';
import { HeroComponent } from "./hero/hero-component";

@Component({
  selector: 'app-home-component',
  imports: [HeroComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent {

}
