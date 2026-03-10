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

    const todayStr = new Date().toLocaleDateString('sv-SE');
    const expiryStr = expiresAt.substring(0, 10);

    if (expiryStr < todayStr) return 'Expired';
    if (expiryStr === todayStr) return 'Ends today';
    
    const diffMs = new Date(expiryStr).getTime() - new Date(todayStr).getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `Ends in ${diffDays} Days`;
  });
}