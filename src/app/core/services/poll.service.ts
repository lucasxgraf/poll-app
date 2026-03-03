import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Survey, Category } from '../../shared/models/poll.interface';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private supabase = inject(SupabaseService).client;

  private surveysSignal = signal<Survey[]>([]);
  surveys = this.surveysSignal.asReadonly();

  private categoriesSignal = signal<Category[]>([]);
  categories = this.categoriesSignal.asReadonly();

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
