import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'filter';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary'); 
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
}
