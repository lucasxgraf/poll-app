import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home-component';
import { LegalComponent } from './features/legal/legal';
import { PrivacyComponent } from './features/privacy/privacy';
import { AuthComponent } from './features/auth/auth.component';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: 'login', component: AuthComponent },
  { path: 'legal', component: LegalComponent },
  { path: 'privacy', component: PrivacyComponent },

  { 
    path: 'create', 
    loadComponent: () => import('./features/home/home-component').then(m => m.HomeComponent) ,
    canActivate: [authGuard]
  }];
