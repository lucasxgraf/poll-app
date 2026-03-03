import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Survey } from '../../shared/models/poll.interface';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private supabase = inject(SupabaseService).client;

  private surveysSignal = signal<Survey[]>([]);
  surveys = this.surveysSignal.asReadonly();

  async fetchAllSurveys() {
  const { data, error } = await this.supabase
    .from('surveys')
    .select('*');

  if (error) {
    console.error('Supabase Error:', error);
    return;
  }

  console.log('Empfangene Daten:', data);
  this.surveysSignal.set(data as Survey[]);
}
}
