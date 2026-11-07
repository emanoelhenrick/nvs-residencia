import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ROLE_LABEL } from '../../../../constants/role.constants';
import { IUser } from '../../../../models';
import { Icon } from '../../../../shared/icon/icon';
import { scopeOf } from '../../../../utils/user';

@Component({
  selector: 'app-user-table',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-table.html',
  styleUrl: './user-table.scss',
})
export class UserTable {
  readonly users = input.required<IUser[]>();
  readonly selectedId = input<string | null>(null);
  readonly select = output<string>();

  protected readonly search = signal('');
  protected readonly roleLabel = ROLE_LABEL;
  protected readonly scopeOf = scopeOf;
  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(
      (u) => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  });
}
