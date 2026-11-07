import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/ui/toast.service';
import { AuthService } from '../../../services/auth.service';
import { Callout } from '../../../shared/callout/callout';
import { Icon } from '../../../shared/icon/icon';
import { AuthLayout } from '../auth-layout/auth-layout';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, Callout, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);

  protected readonly sent = signal(false);
  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly form = this._formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.loading()) return;

    const resend = this.sent();
    this.loading.set(true);
    this._authService.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
        if (resend)
          this._toastService.show('Instruções reenviadas, se o e-mail estiver cadastrado.', 'info');
      },
      error: () => {
        this.loading.set(false);
        this._toastService.show('Não foi possível enviar as instruções. Tente novamente.', 'error');
      },
    });
  }
}
