import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';
import { PollService } from '../../../core/services/poll.service';
import { RouterLink } from '@angular/router';
import { Survey } from '../../../shared/models/poll.interface';

@Component({
  selector: 'app-survey-cards-component',
  standalone: true,
  imports: [CommonModule, SurveyCardComponent, RouterLink],
  templateUrl: './survey-cards.component.html',
  styleUrl: './survey-cards.component.scss',
})
export class SurveyCardsComponent implements OnInit{
  private pollService = inject(PollService);

  endingSoonSurveys = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return this.pollService.surveys()
      .filter(survey => this.isEndingSoon(survey, today))
      .sort((a, b) => this.sortByExpiry(a, b));
  });

  ngOnInit(): void {
    this.pollService.fetchAllSurveys();
  }

  private isEndingSoon(survey: Survey, today: string): boolean {
    if (!survey.expires_at) return false;
    const expiryDate = survey.expires_at.substring(0, 10);
    return expiryDate >= today
  }

  private sortByExpiry(a: Survey, b: Survey): number {
    const dateA = a.expires_at || '';
    const dateB = b.expires_at || '';
    return dateA.localeCompare(dateB);
  }
}
