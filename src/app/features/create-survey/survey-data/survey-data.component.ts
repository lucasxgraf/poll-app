import { Component, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
  selectedCategory = signal<string | null>(null);

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

  clearField(controlName: string) {
    this.parentForm.get(controlName)?.setValue('');
    if (controlName === 'category') {
      this.selectedCategory.set(null);
    }
  }

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let trimmed = input.value.replace(/[^0-9]/g, '');
    
    let formatted = '';
    if (trimmed.length > 0) {
      formatted += trimmed.substring(0, 4);
      if (trimmed.length > 4) {
        formatted += '-' + trimmed.substring(4, 6);
      }
      if (trimmed.length > 6) {
        formatted += '-' + trimmed.substring(6, 8);
      }
    }

    this.parentForm.get('expires_at')?.setValue(formatted.substring(0, 10), { emitEvent: false });
  }
}

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(value)) {
      return { invalidDateFormat: true };
    }

    const [y, m, d] = value.split('-').map(Number);
    const inputDate = new Date(y, m - 1, d);
    const isValid = inputDate.getFullYear() === y && 
                    inputDate.getMonth() === m - 1 && 
                    inputDate.getDate() === d;

    if (!isValid) return { invalidDate: true };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { pastDate: true };
    }

    return null;
  };
}