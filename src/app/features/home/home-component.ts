import { Component } from '@angular/core';
import { HeroComponent } from "./hero/hero.component";
import { SurveyCardsComponent } from './survey-cards/survey-cards.component';
import { Categories } from "./categories/categories.component";


@Component({
  selector: 'app-home-component',
  imports: [HeroComponent, SurveyCardsComponent, Categories],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent {

}
