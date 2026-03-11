import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, AuthResponse, AuthError } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService).client;
  currentUser = signal<User | null>(null);

  async initializeAuth(): Promise<void> {
    const { data, error } = await this.supabase.auth.getSession();
    if (!error && data.session) {
      this.currentUser.set(data.session.user);
    }
    
    this.subscribeToAuthChanges();
  }

  private subscribeToAuthChanges(): void {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async signUp(email: string, pass: string): Promise<AuthResponse> {
    const response = await this.supabase.auth.signUp({ email, password: pass });
    return this.handleAuthResponse(response);
  }

  async signIn(email: string, pass: string): Promise<AuthResponse> {
    const response = await this.supabase.auth.signInWithPassword({ email, password: pass });
    return this.handleAuthResponse(response);
  }

  async signInAnonymously(): Promise<AuthResponse> {
    const response = await this.supabase.auth.signInAnonymously();
    return this.handleAuthResponse(response);
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  private handleAuthResponse(response: AuthResponse): AuthResponse {
    const { data, error } = response;
    
    if (!error && data.user) {
      this.currentUser.set(data.user);
    }
    
    return response;
  }
}