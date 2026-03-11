import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { PollService } from '../../../core/services/poll.service';
import { RouterLink } from '@angular/router';
import { Survey } from '../../../shared/models/poll.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, SurveyCardComponent, ButtonComponent, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class Categories implements OnInit {
  private pollService = inject(PollService);
  private eRef = inject(ElementRef);

  currentFilter = signal<'active' | 'past'>('active');
  selectedCategory = signal('All Categories');
  isDropdownOpen = signal(false);

  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.dropdownWrapper) return;
    const clickedInside = this.dropdownWrapper.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isDropdownOpen.set(false);
    }
  }

  categoryOptions = computed(() => [
    'All Categories', 
    ...this.pollService.categories().map(c => c.name)
  ]);

  filteredSurveys = computed(() => {
    const today = this.getTodayIsoString();
    return this.pollService.surveys().filter(survey => this.isSurveyMatch(survey, today));
  });

  ngOnInit() {
    this.pollService.fetchCategories();
    this.pollService.fetchAllSurveys();
  }

  setFilter(filter: 'active' | 'past') {
    this.currentFilter.set(filter);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.isDropdownOpen.set(false);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  private isSurveyMatch(survey: Survey, today: string): boolean {
    return this.matchesStatus(survey, today) && this.matchesCategory(survey);
  }

  private matchesStatus(survey: Survey, today: string): boolean {
    const isExpired = this.checkIfExpired(survey, today);
    return this.currentFilter() === 'active' ? !isExpired : isExpired;
  }

  private matchesCategory(survey: Survey): boolean {
    const category = this.selectedCategory();
    return category === 'All Categories' || survey.category === category;
  }

  private checkIfExpired(survey: Survey, today: string): boolean {
    if (!survey.expires_at) return false;
    const expiryDate = survey.expires_at.substring(0, 10);
    return expiryDate < today;
  }

  private getTodayIsoString(): string {
    return new Date().toLocaleDateString('sv-SE');
  }
}