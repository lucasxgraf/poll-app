import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home-component';
import { LegalComponent } from './features/legal/legal';
import { PrivacyComponent } from './features/privacy/privacy';

export const routes: Routes = [
  { path:"", component: HomeComponent},
  { path: 'legal', component: LegalComponent },
  { path: 'privacy', component: PrivacyComponent },
];
