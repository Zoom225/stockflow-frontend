import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/services/api-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly isPasswordVisible = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: [
      'demo@stockflow.app',
      [Validators.required, Validators.email, Validators.maxLength(150)],
    ],
    password: ['DemoStock2026!', [Validators.required, Validators.maxLength(100)]],
  });

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(this.getRedirectUrl()),
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof ApiError
              ? error.message
              : "La connexion n'a pas pu être finalisée. Réessayez.",
          );
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((isVisible) => !isVisible);
  }

  private getRedirectUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    return returnUrl?.startsWith('/') &&
      !returnUrl.startsWith('//') &&
      !returnUrl.startsWith('/login')
      ? returnUrl
      : '/dashboard';
  }
}
