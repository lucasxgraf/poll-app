import { Component, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { Category } from '../../../shared/models/poll.interface';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { PollService } from '../../../core/services/poll.service';

@Component({
  selector: 'app-survey-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, ButtonComponent],
  templateUrl: './survey-data.component.html',
  styleUrl: './survey-data.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class SurveyDataComponent {
  private parentContainer = inject(ControlContainer);
  private pollService = inject(PollService);
  categories = input.required<Category[]>();
  isDropdownOpen = signal(false);
  selectedCategory = signal('Select Categories');

  get parentForm() {
    return (this.parentContainer as FormGroupDirective).form;
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.parentForm.patchValue({ category: category });
    this.isDropdownOpen.set(false);
  }

  categoryOptions = computed(() => {
    const dbCategories = this.pollService.categories().map(c => c.name);
    return dbCategories;
  });
}