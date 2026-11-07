import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/ui/toast.service';
import { IUnit } from '../../../models';
import { AuthService } from '../../../services/auth.service';
import { UnitsService } from '../../../services/units.service';
import { Callout } from '../../../shared/callout/callout';
import { AuthLayout } from '../auth-layout/auth-layout';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, Callout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.html',
})
export class Register implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _toastService = inject(ToastService);

  protected readonly units = signal<IUnit[]>([]);
  protected readonly loading = signal(false);
  protected readonly done = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');

  protected readonly form = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    unitId: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this._unitsService.list().subscribe({
      next: (list) => this.units.set(list),
      error: () => this.error.set('Não foi possível carregar as unidades. Tente novamente.'),
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this._authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
        this._toastService.show('Solicitação de cadastro enviada com sucesso!', 'success');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Ocorreu um erro ao realizar o cadastro. Tente novamente.';
        this.error.set(msg);
        this._toastService.show(msg, 'error');
      },
    });
  }
}
