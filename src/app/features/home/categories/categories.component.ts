import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { PollService } from '../../../core/services/poll.service';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, SurveyCardComponent, ButtonComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class Categories {
  private pollService = inject(PollService);

  currentFilter = signal<'active' | 'past'>('active');

  filteredSurveys = computed(() => {
    const allSurveys = this.pollService.surveys();
    const now = new Date();

    return allSurveys.filter((survey) => {
      const isExpired = survey.expires_at ? new Date(survey.expires_at) < now : false;
      
      return this.currentFilter() === 'active' ? !isExpired : isExpired;
    });
  });

  setFilter(filter: 'active' | 'past') {
    this.currentFilter.set(filter);
  }
}
