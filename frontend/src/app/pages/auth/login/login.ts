import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '../../../core/session/session.store';
import { ToastService } from '../../../core/ui/toast.service';
import { AuthService } from '../../../services/auth.service';
import { Callout } from '../../../shared/callout/callout';
import { Icon } from '../../../shared/icon/icon';
import { AuthLayout } from '../auth-layout/auth-layout';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, Callout, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _session = inject(SessionStore);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');

  protected readonly form = this._formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected submit(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this._authService.login({ username: email, password }).subscribe({
      next: ({ token }) => {
        this.loading.set(false);
        if (!this._session.start(token)) {
          this.error.set('Resposta de autenticação inválida.');
          return;
        }
        this._toastService.show('Login realizado com sucesso!', 'success');
        this._router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'E-mail ou senha inválidos.';
        this.error.set(msg);
        this._toastService.show(msg, 'error');
      },
    });
  }
}
