import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { PollService } from '../../../core/services/poll.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, SurveyCardComponent, ButtonComponent, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class Categories {
  private pollService = inject(PollService);
  currentFilter = signal<'active' | 'past'>('active');
  isDropdownOpen = signal(false);
  selectedCategory = signal('All Categories');

  ngOnInit() {
    this.pollService.fetchCategories();
    this.pollService.fetchAllSurveys();
  }

  filteredSurveys = computed(() => {
  const allSurveys = this.pollService.surveys();
  const statusFilter = this.currentFilter();
  const categoryFilter = this.selectedCategory();
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return allSurveys.filter((survey) => {
    if (!survey.expires_at) 
      return statusFilter === 'active';

    const expiryDate = new Date(survey.expires_at);
    expiryDate.setHours(0, 0, 0, 0);
    const isExpired = expiryDate < now;
    const matchesStatus = statusFilter === 'active' ? !isExpired : isExpired;
    const matchesCategory = categoryFilter === 'All Categories' || survey.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });
});

  setFilter(filter: 'active' | 'past') {
    this.currentFilter.set(filter);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.isDropdownOpen.set(false);
  }

  categoryOptions = computed(() => {
    const dbCategories = this.pollService.categories().map(c => c.name);
    return ['All Categories', ...dbCategories];
  });
}
