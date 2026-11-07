import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROLE_LABEL, ROLES } from '../../../../constants/role.constants';
import { SessionStore } from '../../../../core/session/session.store';
import { ToastService } from '../../../../core/ui/toast.service';
import { IUser, Role } from '../../../../models';
import { UsersService } from '../../../../services/users.service';
import { Icon } from '../../../../shared/icon/icon';
import { errorMessage } from '../../../../utils/http';
import { scopeOf } from '../../../../utils/user';

@Component({
  selector: 'app-user-edit-form',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-edit-form.html',
})
export class UserEditForm {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _usersService = inject(UsersService);
  private readonly _session = inject(SessionStore);
  private readonly _toastService = inject(ToastService);

  readonly user = input.required<IUser>();
  readonly saved = output<void>();

  protected readonly roleLabel = ROLE_LABEL;
  protected readonly roles = ROLES;

  protected readonly scopeOf = scopeOf;
  protected readonly submitted = signal(false);
  protected readonly busy = signal(false);
  private readonly _tick = signal(0);

  protected readonly form = this._formBuilder.nonNullable.group({
    role: ['TRIAGE_AGENT' as Role],
    active: [true],
    justification: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected readonly changed = computed(() => {
    this._tick();
    const u = this.user();
    const v = this.form.getRawValue();
    return u.role !== v.role || u.active !== v.active;
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this._tick.update((n) => n + 1));
    effect(() => {
      const u = this.user();
      untracked(() => {
        this.submitted.set(false);
        this.form.reset({ role: u.role, active: u.active, justification: '' });
      });
    });
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.busy()) return;

    const { role, active, justification } = this.form.getRawValue();
    const self = this._session.user();
    if (self && this.user().id === self.id && (!active || role !== 'LEADER')) {
      this._toastService.show('Você não pode inativar ou rebaixar o seu próprio acesso.', 'error');
      return;
    }

    this.busy.set(true);
    this._usersService
      .updateAccess(this.user().id, { role, active, justification: justification.trim() })
      .subscribe({
        next: (updated) => {
          this.busy.set(false);
          this._toastService.show(`Acesso de ${updated.name} atualizado com sucesso!`);
          this.saved.emit();
        },
        error: (err) => {
          this.busy.set(false);
          this._toastService.show(errorMessage(err, 'Erro ao atualizar o acesso do usuário.'), 'error');
        },
      });
  }
}
