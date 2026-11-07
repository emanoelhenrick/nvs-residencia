import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ToastService } from '../../../core/ui/toast.service';
import { IAccessLog, IUser } from '../../../models';
import { AccessLogsService } from '../../../services/access-logs.service';
import { UsersService } from '../../../services/users.service';
import { errorMessage } from '../../../utils/http';
import { AccessLogCard } from './access-log-card/access-log-card';
import { RoleProfilesCard } from './role-profiles-card/role-profiles-card';
import { UserEditForm } from './user-edit-form/user-edit-form';
import { UserTable } from './user-table/user-table';

@Component({
  selector: 'app-user-admin',
  imports: [UserTable, UserEditForm, RoleProfilesCard, AccessLogCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-admin.html',
})
export class UserAdmin {
  private readonly _usersService = inject(UsersService);
  private readonly _accessLogsService = inject(AccessLogsService);
  private readonly _toastService = inject(ToastService);

  /** Muda quando outra tela cria um usuário; força nova consulta. */
  readonly version = input(0);

  protected readonly users = signal<IUser[]>([]);
  protected readonly log = signal<IAccessLog | null>(null);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selected = computed<IUser | undefined>(
    () => this.users().find((u) => u.id === this.selectedId()) ?? this.users()[0],
  );

  constructor() {
    effect(() => {
      this.version();
      untracked(() => this.load());
    });
  }

  protected load(): void {
    this._usersService.list().subscribe({
      next: (list) => this.users.set(list),
      error: (err) => this._toastService.show(errorMessage(err, 'Erro ao carregar a lista de usuários.'), 'error'),
    });
    this._accessLogsService.list(1).subscribe({
      next: (logs) => this.log.set(logs[0] ?? null),
      error: () => {},
    });
  }
}
