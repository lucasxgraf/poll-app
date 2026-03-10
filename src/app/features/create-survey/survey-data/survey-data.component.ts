import { Component, inject, input, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { Category } from '../../../shared/models/poll.interface';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { PollService } from '../../../core/services/poll.service';
import { HeaderService } from '../../../core/services/header.service';

@Component({
  selector: 'app-survey-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, ButtonComponent],
  templateUrl: './survey-data.component.html',
  styleUrl: './survey-data.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class SurveyDataComponent implements OnInit {
  private parentContainer = inject(ControlContainer);
  private pollService = inject(PollService);
  private headerService = inject(HeaderService);

  categories = input.required<Category[]>();
  isDropdownOpen = signal(false);
  selectedCategory = signal<string | null>(null);

  get parentForm() { return (this.parentContainer as FormGroupDirective).form; }
  get categoryControl() { return this.parentForm.get('category'); }

  categoryOptions = computed(() => this.pollService.categories().map(c => c.name));

  ngOnInit() {
    this.headerService.setCreateButtonVisible(false);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.parentForm.patchValue({ category });
    this.isDropdownOpen.set(false);
  }

  clearField(controlName: string) {
    this.parentForm.get(controlName)?.setValue('');
    if (controlName === 'category') this.selectedCategory.set(null);
  }

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatToISODate(input.value);
    this.parentForm.get('expires_at')?.setValue(formatted, { emitEvent: false });
  }

  private formatToISODate(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    return this.applyDateMask(digits).substring(0, 10);
  }

  private applyDateMask(d: string): string {
    if (d.length <= 4) return d;
    if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  }

  showCategoryError(): boolean {
    const ctrl = this.categoryControl;
    return !!(ctrl?.invalid && (ctrl.touched || ctrl.dirty));
  }
}

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return { invalidDateFormat: true };
    if (!isValidCalendarDate(val)) return { invalidDate: true };
    if (isDateInPast(val)) return { pastDate: true };

    return null;
  };
}

function isValidCalendarDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function isDateInPast(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const inputDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
}