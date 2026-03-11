import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
})
export class InputFieldComponent {
  label = input<string>('');
  id = input.required<string>(); 
  placeholder = input<string>('');
  type = input<string>('text');
  control = input.required<FormControl<string>>();
  autocomplete = input<string>('off'); 
  maxlength = input<number>(100);

  get showError(): boolean {
    const ctrl = this.control();
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }
}