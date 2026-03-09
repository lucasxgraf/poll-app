// features/survey-view/survey-view.component.ts
import { Component, inject, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PollService } from '../../core/services/poll.service';
import { FullSurvey } from '../../shared/models/poll.interface';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';

@Component({
  selector: 'app-survey-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './survey-view.component.html',
  styleUrl: './survey-view.component.scss'
})
export class SurveyViewComponent implements OnInit {
  private pollService = inject(PollService);
  private fb = inject(FormBuilder);
  
  id = input.required<string>(); 
  survey = signal<FullSurvey | null>(null);
  isLoading = signal(true);
  surveyForm: FormGroup = this.fb.group({});

  async ngOnInit() {
    await this.loadSurvey();
  }

  private async loadSurvey() {
    this.isLoading.set(true);
    const data = await this.pollService.fetchSurveyById(this.id());
    if (data) {
      this.survey.set(data);
      this.buildForm(data);
    }
    this.isLoading.set(false);
  }

  private buildForm(survey: FullSurvey) {
    survey.questions.forEach(q => {
      const defaultValue = q.allow_multiple ? [] : '';
      this.surveyForm.addControl(q.id, this.fb.control(defaultValue, Validators.required));
    });
  }

  toggleOption(questionId: string, optionId: string, allowMultiple: boolean) {
    const control = this.surveyForm.get(questionId);
    if (!control) return;

    if (!allowMultiple) {
      control.setValue(optionId);
    } else {
      const current: string[] = control.value;
      control.setValue(current.includes(optionId) 
        ? current.filter(id => id !== optionId) 
        : [...current, optionId]
      );
    }
    control.markAsTouched();
  }

  isSelected(qId: string, oId: string): boolean {
    const val = this.surveyForm.get(qId)?.value;
    return Array.isArray(val) ? val.includes(oId) : val === oId;
  }

  onSubmit() {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }
    console.log('Votes submitted:', this.surveyForm.value);
  }
}