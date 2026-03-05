import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { Category } from '../../../shared/models/poll.interface';

@Component({
  selector: 'app-survey-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  templateUrl: './survey-data.component.html',
  styleUrl: './survey-data.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class SurveyDataComponent {
  private parentContainer = inject(ControlContainer);
  categories = input.required<Category[]>();

  get parentForm() {
    return (this.parentContainer as FormGroupDirective).form;
  }
}