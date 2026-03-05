import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PollService } from '../../core/services/poll.service';
import { SurveyDataComponent } from './survey-data/survey-data.component';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SurveyDataComponent],
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.scss',
})
export class CreateSurveyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pollService = inject(PollService);

  categories = this.pollService.categories;

  surveyForm = this.fb.group({
    title: [''],
    description: [''],
    expires_at: [''],
    category: [''],
    questions: this.fb.array([])
  });

  ngOnInit() {
    this.pollService.fetchCategories();
  }
}