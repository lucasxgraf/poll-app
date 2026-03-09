import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { PollService } from '../../core/services/poll.service';
import { dateValidator, SurveyDataComponent } from './survey-data/survey-data.component';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ButtonComponent } from '../../shared/ui/button/button';
import { QuestionItemComponent } from "../create-survey/question-item/question-item.component";
import { AuthService } from '../../core/services/auth.service';
import { CreateSurveyInput } from '../../shared/models/poll.interface';
import { ToastService } from '../../core/services/toast.service';


@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SurveyDataComponent, BadgeComponent, ButtonComponent, QuestionItemComponent],
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.scss',
})
export class CreateSurveyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pollService = inject(PollService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  categories = this.pollService.categories;
  isLoading = signal(false);


  surveyForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(6)]],
    description: [''],
    expires_at: ['', [dateValidator()]],
    category: ['', Validators.required],
    questions: this.fb.array<any>([])
  });

  get questions() {
    return this.surveyForm.get('questions') as FormArray;
  }

  ngOnInit() {
    this.pollService.fetchCategories();
    this.addQuestion();
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      question_text: ['', Validators.required],
      allow_multiple: [false],
      options: this.fb.array([
        this.fb.group({ label: ['', Validators.required] }),
        this.fb.group({ label: ['', Validators.required] })
      ])
    });
    
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number) {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }

  async onSubmit() {
    if (this.surveyForm.invalid) {
      return this.handleInvalidForm();
    }

    const user = this.authService.currentUser();
    if (!user) {
      return alert('You must be logged in!');
    }

    await this.processSurveySubmission(user.id);
  }

  private handleInvalidForm() {
    this.surveyForm.markAllAsTouched();
  }

  private async processSurveySubmission(userId: string) {
  this.isLoading.set(true);
  
  const surveyData = this.surveyForm.getRawValue() as CreateSurveyInput;
  const result = await this.pollService.createFullSurvey(surveyData, userId);

  if (result.success && result.id) {
    this.toastService.show('Your survey is now published');
    this.router.navigate(['/survey', result.id]);
  } else {
    this.handleSubmissionError();
  }
}

  private handleSubmissionError() {
    alert('Fehler beim Speichern. Bitte versuche es erneut.');
    this.isLoading.set(false);
  }
}