import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROLE_DESC, ROLE_LABEL, ROLES } from '../../../../constants/role.constants';

@Component({
  selector: 'app-role-profiles-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-profiles-card.html',
  styles: ['.perm { background: #f6f6fa; padding: 12px 14px; border-radius: 6px; } .perm p { margin-top: 4px; }'],
})
export class RoleProfilesCard {
  protected readonly roles = ROLES;
  protected readonly roleLabel = ROLE_LABEL;
  protected readonly roleDesc = ROLE_DESC;
}
