import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormArray, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { ButtonComponent } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-question-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, ButtonComponent],
  templateUrl: './question-item.component.html',
  styleUrl: './question-item.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class QuestionItemComponent {
  private parentContainer = inject(ControlContainer);
  index = input.required<number>();
  removeQuestion = output<number>();

  get questionsArray() { return (this.parentContainer as FormGroupDirective).form.get('questions') as FormArray; }
  get questionGroup() { return this.questionsArray.at(this.index()) as FormGroup; }
  get optionsArray() { return this.questionGroup.get('options') as FormArray; }

  addOption() {
    if (this.optionsArray.length < 6) { 
      this.optionsArray.push(new FormGroup({
        label: new FormControl('', Validators.required)
      }));
    }
  }

  removeOption(oIdx: number) {
    if (this.optionsArray.length > 2) {
      this.optionsArray.removeAt(oIdx);
    }
  }

  getOptionControl(oIdx: number): FormControl<string> {
    return this.optionsArray.at(oIdx).get('label') as FormControl<string>;
  }
}