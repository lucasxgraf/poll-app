import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge';
import { SurveyInterface } from '../../models/survey.interface';

@Component({
  selector: 'app-survey-card',
  imports: [CommonModule, BadgeComponent],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCardComponent {
  survey = input.required<SurveyInterface>();
  isHighlight = input<boolean>(false);
}
