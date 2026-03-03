import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';
import { PollService } from '../../../core/services/poll.service';

@Component({
  selector: 'app-survey-cards-component',
  standalone: true,
  imports: [CommonModule, SurveyCardComponent],
  templateUrl: './survey-cards.component.html',
  styleUrl: './survey-cards.component.scss',
})
export class SurveyCardsComponent implements OnInit{

  private pollService = inject(PollService);
  surveys = this.pollService.surveys;

  ngOnInit(): void {
    this.pollService.fetchAllSurveys()
  }
}
