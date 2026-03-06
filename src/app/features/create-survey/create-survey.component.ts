import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PollService } from '../../core/services/poll.service';
import { SurveyDataComponent } from './survey-data/survey-data.component';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ButtonComponent } from '../../shared/ui/button/button';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SurveyDataComponent, BadgeComponent, ButtonComponent],
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.scss',
})
export class CreateSurveyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pollService = inject(PollService);
  private router = inject(Router);

  categories = this.pollService.categories;
  isLoading = signal(false);


  surveyForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    expires_at: [''],
    category: ['', Validators.required],
    questions: this.fb.array([])
  });

  ngOnInit() {
    this.pollService.fetchCategories();
  }

  cancel() {
    this.router.navigate(['/']);
  }

  async onSubmit() {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }
    console.log('Formular-Daten:', this.surveyForm.getRawValue());
  }
}