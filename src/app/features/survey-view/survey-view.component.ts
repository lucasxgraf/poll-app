import { Component, inject, OnInit, signal, input, OnDestroy, computed } from '@angular/core';
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
  private authService = inject(AuthService);
  private headerService = inject(HeaderService);
  private voteChannel: RealtimeChannel | null = null;
  
  id = input.required<string>();
  survey = signal<FullSurvey | null>(null);
  allVotes = signal<Vote[]>([]);
  localSelection = signal<VoteInput[]>([]);
  
  isSubmitting = signal(false);
  isLoading = signal(true);
  hasVoted = signal(false);

  surveyForm: FormGroup = this.fb.group({});

  displayVotes = computed(() => [...this.allVotes(), ...this.localSelection()]);

  isExpired = computed(() => {
    const s = this.survey();
    if (!s?.expires_at) return false;
    const today = new Date().toLocaleDateString('sv-SE');
    return s.expires_at.substring(0, 10) < today;
  });

  async ngOnInit() {
    this.headerService.setCreateButtonVisible(true);
    const data = await this.loadSurveyData();
    
    if (data) {
      this.handleInitialState(data);
      await this.loadInitialVotes(data);
      this.setupRealtimeVotes(data);
    }
  }

  private async loadSurveyData(): Promise<FullSurvey | null> {
    this.isLoading.set(true);
    const data = await this.pollService.fetchSurveyById(this.id());
    if (data) {
      this.survey.set(data);
      this.initializeForm(data);
    }
    this.isLoading.set(false);
    return data;
  }

  private initializeForm(survey: FullSurvey) {
    survey.questions.forEach(q => {
      const defaultValue = q.allow_multiple ? [] : '';
      this.surveyForm.addControl(q.id, this.fb.control(defaultValue, Validators.required));
    });
  }

  private handleInitialState(survey: FullSurvey): void {
    if (this.isExpired()) {
      this.applyAlreadyVotedState();
    } else {
      this.checkUserVoteStatus(survey);
    }
  }

  private async checkUserVoteStatus(survey: FullSurvey) {
    const user = this.authService.currentUser();
    if (!user) return;

    const questionIds = survey.questions.map(q => q.id);
    const alreadyVoted = await this.pollService.hasUserVoted(questionIds, user.id);
    if (alreadyVoted) this.applyAlreadyVotedState();
  }

  private applyAlreadyVotedState() {
    this.hasVoted.set(true);
    this.loadSelectionFromStorage();
    this.surveyForm.disable();
    this.localSelection.set([]);
  }

  private async loadInitialVotes(survey: FullSurvey) {
    const questionIds = survey.questions.map(q => q.id);
    const votes = await this.pollService.fetchVotesForQuestions(questionIds);
    this.allVotes.set(votes);
  }

  private setupRealtimeVotes(survey: FullSurvey) {
    const questionIds = survey.questions.map(q => q.id);
    this.voteChannel = this.pollService.subscribeToVotes(survey.id, (payload) => {
      if (questionIds.includes(payload.new.poll_id)) {
        this.allVotes.update(votes => [...votes, payload.new]);
      }
    });
  }

  toggleOption(qId: string, oId: string, multiple: boolean) {
    if (this.surveyForm.disabled) return;
    const control = this.surveyForm.get(qId);
    if (!control) return;

    control.setValue(multiple ? this.toggleInArray(control.value, oId) : oId);
    control.markAsTouched();

    this.localSelection.set(this.mapFormToVotes());
  }

  private toggleInArray(current: string[], id: string): string[] {
    return current.includes(id) ? current.filter(i => i !== id) : [...current, id];
  }

  async onSubmit() {
    if (this.surveyForm.invalid || this.isExpired()) return this.surveyForm.markAllAsTouched();
    
    const user = this.authService.currentUser();
    if (user) await this.performSubmission(user.id);
  }

  private async performSubmission(userId: string) {
    this.isSubmitting.set(true);
    const votes = this.mapFormToVotes();
    const ids = this.survey()?.questions.map(q => q.id) || [];
    
    const result = await this.pollService.submitVotes(votes, userId, ids);
    result.success ? await this.handleVoteSuccess() : this.toastService.show(result.error);
    
    this.isSubmitting.set(false);
  }

  private mapFormToVotes(): VoteInput[] {
    const formValues = this.surveyForm.getRawValue();
    return Object.entries(formValues).flatMap(([questionId, value]) => {
      const optionIds = Array.isArray(value) ? value : [value];
      return optionIds.filter(id => !!id).map(id => ({ poll_id: questionId, option_id: id }));
    });
  }

  private async handleVoteSuccess() {
    await this.toastService.show('Thanks for voting!');
    this.saveSelectionToStorage();
    this.applyAlreadyVotedState();
  }

  private saveSelectionToStorage() {
    localStorage.setItem(`survey_selection_${this.id()}`, JSON.stringify(this.surveyForm.getRawValue()));
  }

  private loadSelectionFromStorage() {
    const saved = localStorage.getItem(`survey_selection_${this.id()}`);
    if (saved) {
      this.surveyForm.patchValue(JSON.parse(saved));
      this.localSelection.set([]);
    }
  }

  isSelected(qId: string, oId: string): boolean {
    const val = this.surveyForm.get(qId)?.value;
    return Array.isArray(val) ? val.includes(oId) : val === oId;
  }

  getOptionPercentage(questionId: string, optionId: string): number {
    const votes = this.displayVotes();
    const total = votes.filter(v => v.poll_id === questionId).length;
    const count = votes.filter(v => v.option_id === optionId).length;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  ngOnDestroy() {
    this.voteChannel?.unsubscribe();
  }
}