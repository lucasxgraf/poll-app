import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge';
import { Survey } from '../../models/poll.interface';

@Component({
  selector: 'app-survey-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCardComponent {
  survey = input.required<Survey>();
  variant = input<'highlight' | 'list'>('highlight');

  remainingTime = computed(() => {
    const expiresAt = this.survey().expires_at;
    if (!expiresAt) return 'No limit';

    const end = new Date(expiresAt);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Ends today';
    } else if (diffDays === 1) {
      return 'Ends in 1 Day';
    } else {
      return `Ends in ${diffDays} Days`;
    }
  });
}