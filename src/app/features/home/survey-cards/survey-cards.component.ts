import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyInterface } from '../../../shared/models/survey.interface';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';



@Component({
  selector: 'app-survey-cards-component',
  standalone: true,
  imports: [CommonModule, SurveyCardComponent],
  templateUrl: './survey-cards.component.html',
  styleUrl: './survey-cards.component.scss',
})
export class SurveyCardsComponent {
  surveys = signal<SurveyInterface[]>([
    {
      id: '1',
      title: "Let's Plan the Next Team Event Together",
      category: 'Team activities',
      endDate: 'Ends in 1 Day',
      status: 'active'
    },
    {
      id: '2',
      title: 'Fit & wellness survey!',
      category: 'Health & Wellness',
      endDate: 'Ends in 2 Days',
      status: 'active'
    },
    {
      id: '3',
      title: 'Gaming habits and favorite games!',
      category: 'Gaming & Entertainment',
      endDate: 'Ends in 3 Days',
      status: 'active'
    },
  ]);
}
