import { inject, Injectable, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Survey, Category, CreateSurveyInput, CreateQuestionInput, CreateOptionInput, FullSurvey, VoteInput, Vote } from '../../shared/models/poll.interface';
import { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PollService implements OnDestroy {
  private supabase = inject(SupabaseService).client;
  private surveysSignal = signal<Survey[]>([]);
  private categoriesSignal = signal<Category[]>([]);
  private surveyChannel: RealtimeChannel | null = null;
  
  surveys = this.surveysSignal.asReadonly();
  categories = this.categoriesSignal.asReadonly();

  async createFullSurvey(formData: CreateSurveyInput, userId: string) {
    try {
      const surveyId = await this.insertSurveyRecord(formData, userId);

      await this.processQuestions(surveyId, formData.questions);

      return { success: true, id: surveyId };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async insertSurveyRecord(formData: CreateSurveyInput, userId: string): Promise<string> {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    const fallbackDateString = defaultDate.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('surveys')
      .insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        expires_at: formData.expires_at || fallbackDateString,
        owner_id: userId
      })
      .select('id')
      .single();

    if (error) throw error;
      return data.id;
  }

  private async processQuestions(surveyId: string, questions: CreateQuestionInput[]) {
    for (const questionData of questions) {
      await this.insertQuestionWithAnswers(surveyId, questionData);
    }
  }

  private async insertQuestionWithAnswers(surveyId: string, qData: CreateQuestionInput) {
    const { data: question, error: qError } = await this.supabase
      .from('polls_questions')
      .insert({
        survey_id: surveyId,
        question_text: qData.question_text,
        allow_multiple: qData.allow_multiple
      })
      .select('id')
      .single();

    if (qError) throw qError;

    await this.insertPollOptions(question.id, qData.options);
  }

  private async insertPollOptions(questionId: string, options: CreateOptionInput[]) {
    const preparedOptions = options.map(opt => ({
      poll_id: questionId,
      label: opt.label
    }));

    const { error } = await this.supabase
      .from('polls_options')
      .insert(preparedOptions);

    if (error) throw error;
  }

  async submitVotes(votes: VoteInput[], userId: string, questionIds: string[]) {
  try {
    const alreadyVoted = await this.hasUserVoted(questionIds, userId);
    if (alreadyVoted) {
      throw new Error('You have already participated in this survey.');
    }
    const { error } = await this.supabase
      .from('votes')
      .insert(votes);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

  async hasUserVoted(questionIds: string[], userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('votes')
      .select('id')
      .in('poll_id', questionIds)
      .eq('voter_id', userId)
      .limit(1);

    if (error) return false;
    return !!(data && data.length > 0);
  }

  async fetchAllSurveys() {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*');

    if (error) {
      return;
    }
    this.surveysSignal.set(data as Survey[]);

    if (!this.surveyChannel) {
      this.surveyChannel = this.subscribeToSurveys();
    }
  }

  async fetchSurveyById(id: string): Promise<FullSurvey | null> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(`*,
        questions:polls_questions (
          *,
          options:polls_options (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data as unknown as FullSurvey;
  }

  async fetchCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return;
    }

    this.categoriesSignal.set(data as Category[]);
  }

  
  async fetchVotesForQuestions(questionIds: string[]): Promise<Vote[]> {
    const { data, error } = await this.supabase
    .from('votes')
    .select('*')
    .in('poll_id', questionIds);
    
    if (error) {
      return [];
    }
    return data as Vote[];
  }
  
  private subscribeToSurveys(): RealtimeChannel {
    const channel = this.supabase
      .channel('public-surveys-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'surveys' },
        (payload) => this.handleSurveyChange(payload)
      )
      .subscribe();
      
    return channel;
  }

  private handleSurveyChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    this.surveysSignal.update(currentSurveys => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord as Survey, ...currentSurveys];
        case 'UPDATE':
          return currentSurveys.map(s => s.id === newRecord.id ? (newRecord as Survey) : s);
        case 'DELETE':
          return currentSurveys.filter(s => s.id === oldRecord.id);
        default:
          return currentSurveys;
      }
    });
  }

  subscribeToVotes(surveyId: string, callback: (payload: RealtimePostgresInsertPayload<Vote>) => void): RealtimeChannel {
  return this.supabase
    .channel(`votes-realtime-${surveyId}`) 
    .on<Vote>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'votes'
      },
      (payload) => callback(payload)
    )
    .subscribe();
}

  ngOnDestroy() {
    if (this.surveyChannel) {
      this.surveyChannel.unsubscribe();
    }
  }
}