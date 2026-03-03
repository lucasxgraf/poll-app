import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge';
import { Survey } from '../../models/poll.interface';

@Component({
  selector: 'app-survey-card',
  imports: [CommonModule, BadgeComponent],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCardComponent {
  survey = input.required<Survey>();

  variant = input<'highlight' | 'list'>('highlight'); 
}
