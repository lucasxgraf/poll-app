import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button';
import { InputFieldComponent } from "../../shared/components/input-field/input-field.component";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputFieldComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoginMode = signal(true);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  authForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get emailCtrl() { 
    return this.authForm.controls.email; 
  }
  
  get passCtrl() { 
    return this.authForm.controls.password; 
  }

  toggleMode() {
    this.isLoginMode.update(value => !value);
    this.errorMessage.set(null);
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.authForm.getRawValue();
    
    const result = this.isLoginMode() 
      ? await this.authService.signIn(email, password)
      : await this.authService.signUp(email, password);

    if (result.error) {
      this.errorMessage.set(result.error.message);
      this.isLoading.set(false);
    } else {
      this.navigateAfterAuth();
    }
  }

  async onGuestLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.signInAnonymously();

    if (result.error) {
      this.errorMessage.set(result.error.message);
      this.isLoading.set(false);
    } else {
      this.navigateAfterAuth();
    }
  }

  private navigateAfterAuth() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl);
  }
}