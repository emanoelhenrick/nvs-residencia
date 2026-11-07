import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROLE_DESC, ROLE_LABEL, ROLE_SCOPE, ROLES } from '../../../constants/role.constants';
import { screensFor } from '../../../constants/navigation.constants';

@Component({
  selector: 'app-permissions-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permissions-admin.html',
})
export class PermissionsAdmin {
  protected readonly roles = ROLES;
  protected readonly label = ROLE_LABEL;
  protected readonly desc = ROLE_DESC;
  protected readonly scope = ROLE_SCOPE;
  protected readonly screens = screensFor;
}
