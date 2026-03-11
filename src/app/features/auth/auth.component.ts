import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button';
import { InputFieldComponent } from "../../shared/components/input-field/input-field.component";
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputFieldComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy = new Subject<void>();
  private toastService = inject(ToastService)

  isLoginMode = signal(true);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  authForm = this.fb.nonNullable.group({
    email: ['', { 
      validators: [Validators.required, strictEmailValidator()],
      updateOn: 'blur' 
    }],
    password: ['', { 
      validators: [Validators.required, Validators.minLength(6)],
      updateOn: 'blur' 
    }]
  });

  get isSubmitDisabled(): boolean { return this.authForm.invalid || this.isLoading(); }
  get emailCtrl() { return this.authForm.controls.email; }
  get passCtrl() { return this.authForm.controls.password; }

  ngOnInit() {
    this.setupErrorResetListener();
  }

  private setupErrorResetListener() {
    this.authForm.valueChanges
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        if (this.errorMessage()) this.errorMessage.set(null);
      });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  toggleMode() {
    this.isLoginMode.update(v => !v);
    this.errorMessage.set(null);
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }
    await this.performAuthAction();
  }

  private async performAuthAction() {
    this.prepareAuthState();
    const { email, password } = this.authForm.getRawValue();
    const result = this.isLoginMode() 
      ? await this.authService.signIn(email, password)
      : await this.authService.signUp(email, password);
    this.handleAuthResponse(result);
  }

  async onGuestLogin() {
    this.authForm.reset(); 
    this.prepareAuthState();
    const result = await this.authService.signInAnonymously();
    this.handleAuthResponse(result);
  }

  private prepareAuthState(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
  }

  private handleAuthResponse(result: { error?: any }): void {
    if (result.error) {
      this.errorMessage.set(result.error.message);
      this.isLoading.set(false);
      return;
    }

    if (!this.isLoginMode()) {
      this.handleSignUpSuccess();
    } else {
      this.handleAuthSuccess();
    }
  }

  private handleSignUpSuccess(): void {
    this.toastService.show('You successfully created an account! You can login now.');
    this.isLoading.set(false);
    this.authForm.reset();
    this.isLoginMode.set(true);
  }

  private handleAuthSuccess(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl);
  }
}

export function strictEmailValidator(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (!v) return null;

    const [localPart, domainPart] = v.split('@');
    
    const isBasicValid = emailRegex.test(v);
    const hasDoubleDots = v.includes('..');
    const hasInvalidDots = v.startsWith('.') || localPart?.endsWith('.') || domainPart?.startsWith('.');
    
    const isValid = isBasicValid && !hasDoubleDots && !hasInvalidDots;
    return isValid ? null : { strictEmail: true };
  };
}