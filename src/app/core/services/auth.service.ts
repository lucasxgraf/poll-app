import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService).client;

  currentUser = signal<User | null>(null);

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth State Change:', _event, session?.user);
      this.currentUser.set(session?.user ?? null);
    });
  }

  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({ email, password: pass });
  }

  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }
}
