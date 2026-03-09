import { Component, inject, OnInit, signal, input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PollService } from '../../core/services/poll.service';
import { FullSurvey, VoteInput, Vote } from '../../shared/models/poll.interface';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AuthService } from '../../core/services/auth.service';
import { HeaderService } from '../../core/services/header.service';


@Component({
  selector: 'app-survey-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './survey-view.component.html',
  styleUrl: './survey-view.component.scss'
})
export class SurveyViewComponent implements OnInit, OnDestroy {
  private pollService = inject(PollService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private voteChannel: RealtimeChannel | null = null;
  private authService = inject(AuthService);
  private headerService = inject(HeaderService);
  
  id = input.required<string>();
  survey = signal<FullSurvey | null>(null);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  hasVoted = signal<boolean>(false);
  allVotes = signal<Vote[]>([]);

  surveyForm: FormGroup = this.fb.group({});

  async ngOnInit() {
    this.headerService.setCreateButtonVisible(true);
    const data = await this.loadSurvey();
    
    if (data) {
      const user = this.authService.currentUser();
      if (user) {
        const questionIds = data.questions.map(q => q.id);
        const alreadyVoted = await this.pollService.hasUserVoted(questionIds, user.id);
        
        if (alreadyVoted) {
          this.hasVoted.set(true);
          this.loadFromLocalStorage();
          this.surveyForm.disable();
        }
      }

      await this.loadInitialVotes(data);
      this.setupRealtimeVotes(data);
    }
  }

  private saveToLocalStorage() {
    const storageKey = `survey_selection_${this.id()}`;
    const selection = this.surveyForm.getRawValue();
    localStorage.setItem(storageKey, JSON.stringify(selection));
  }

  private loadFromLocalStorage() {
    const storageKey = `survey_selection_${this.id()}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      const selection = JSON.parse(saved);
      this.surveyForm.patchValue(selection);
    }
  }

  private async loadSurvey(): Promise<FullSurvey | null> {
    this.isLoading.set(true);
    const data = await this.pollService.fetchSurveyById(this.id());
    
    if (data) {
      this.survey.set(data);
      this.buildForm(data);
      this.isLoading.set(false);
      return data;
    }
    
    this.isLoading.set(false);
    return null;
  }

  private buildForm(survey: FullSurvey) {
    survey.questions.forEach(q => {
      const defaultValue = q.allow_multiple ? [] : '';
      this.surveyForm.addControl(q.id, this.fb.control(defaultValue, Validators.required));
    });
  }

  private async loadInitialVotes(survey: FullSurvey) {
    const questionIds = survey.questions.map(q => q.id);
    const votes = await this.pollService.fetchVotesForQuestions(questionIds);
    this.allVotes.set(votes);
  }

  private setupRealtimeVotes(survey: FullSurvey) {
    this.voteChannel = this.pollService.subscribeToVotes(survey.id, (payload) => {
      const newVote = payload.new;
      
      const questionIds = survey.questions.map(q => q.id);
      if (questionIds.includes(newVote.poll_id)) {
        this.allVotes.update(votes => [...votes, newVote]);
      }
    });
  }

  ngOnDestroy() {
    this.voteChannel?.unsubscribe();
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

async onSubmit() {
  if (this.surveyForm.invalid) {
    return this.handleInvalidForm();
  }

  await this.processVoteSubmission();
}

private handleInvalidForm() {
  this.surveyForm.markAllAsTouched();
}

private async processVoteSubmission() {
  const user = this.authService.currentUser();
  if (!user) return;

  this.isSubmitting.set(true);

  const votes = this.mapFormToVotes();
  const questionIds = this.survey()?.questions.map(q => q.id) || [];
  
  const result = await this.pollService.submitVotes(votes, user.id, questionIds);

  if (result.success) {
    await this.handleVoteSuccess();
  } else {
    alert(result.error); 
  }

  this.isSubmitting.set(false);
}

private mapFormToVotes(): VoteInput[] {
  const formValues = this.surveyForm.value;
  const votes: VoteInput[] = [];

  Object.keys(formValues).forEach(questionId => {
    const value = formValues[questionId];
    const optionIds = Array.isArray(value) ? value : [value];
    
    optionIds.forEach(optionId => {
      votes.push({ poll_id: questionId, option_id: optionId });
    });
  });

  return votes;
}

  private async handleVoteSuccess() {
    await this.toastService.show('Thanks for voting!');
    this.saveToLocalStorage();
    this.hasVoted.set(true);
    this.surveyForm.disable();
  }

  private handleVoteError() {
    alert('Something went wrong while voting. Please try again.');
  }

  getOptionVotes(optionId: string): number {
    return this.allVotes().filter(v => v.option_id === optionId).length;
  }

  getQuestionTotalVotes(questionId: string): number {
    return this.allVotes().filter(v => v.poll_id === questionId).length;
  }

  getOptionPercentage(questionId: string, optionId: string): number {
    const total = this.getQuestionTotalVotes(questionId);
    if (total === 0) return 0;

    const votes = this.getOptionVotes(optionId);
    return Math.round((votes / total) * 100);
  }
}