import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})

export class SupabaseService {

  public client = createClient(
    environment.supabaseUrl, 
    environment.supabaseKey
  )
}
