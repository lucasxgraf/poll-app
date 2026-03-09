import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Survey, Category, CreateSurveyInput, CreateQuestionInput, CreateOptionInput, FullSurvey } from '../../shared/models/poll.interface';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private supabase = inject(SupabaseService).client;

  private surveysSignal = signal<Survey[]>([]);
  surveys = this.surveysSignal.asReadonly();

  private categoriesSignal = signal<Category[]>([]);
  categories = this.categoriesSignal.asReadonly();

  async createFullSurvey(formData: CreateSurveyInput, userId: string) {
    try {
      const surveyId = await this.insertSurveyRecord(formData, userId);

      await this.processQuestions(surveyId, formData.questions);

      return { success: true };
    } catch (error) {
      console.error('Survey creation failed:', error);
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

  async fetchAllSurveys() {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*');

    if (error) {
      console.error('Supabase Error:', error);
      return;
    }
    this.surveysSignal.set(data as Survey[]);
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
      console.error('Fehler beim Laden des Surveys:', error);
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
      console.error('Error categories:', error);
      return;
    }

    this.categoriesSignal.set(data as Category[]);
  }
}
