import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PageHeader } from '../../shared/page-header/page-header';
import { PermissionsAdmin } from './permissions-admin/permissions-admin';
import { SlaParams } from './sla-params/sla-params';
import { UnitsAdmin } from './units-admin/units-admin';
import { UserAdmin } from './user-admin/user-admin';
import { UserModal } from './user-modal/user-modal';

type Tab = 'usuarios' | 'unidades' | 'permissoes' | 'sla';

@Component({
  selector: 'app-admin',
  imports: [PageHeader, UserAdmin, UnitsAdmin, PermissionsAdmin, SlaParams, UserModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.html',
})
export class Admin {
  protected readonly tab = signal<Tab>('usuarios');
  protected readonly adding = signal(false);
  /** Incrementa a cada usuário criado, para a lista pedir os dados de novo à API. */
  protected readonly usersVersion = signal(0);
  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'usuarios', label: 'Usuários' },
    { id: 'unidades', label: 'Unidades' },
    { id: 'permissoes', label: 'Permissões' },
    { id: 'sla', label: 'Parâmetros SLA' },
  ];

  protected onUserCreated(): void {
    this.adding.set(false);
    this.usersVersion.update((v) => v + 1);
  }
}
