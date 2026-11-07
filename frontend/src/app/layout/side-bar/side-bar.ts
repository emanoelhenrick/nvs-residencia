import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../constants/navigation.constants';
import { SessionStore } from '../../core/session/session.store';
import { UiService } from '../../core/ui/ui.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  protected readonly ui = inject(UiService);
  private readonly _session = inject(SessionStore);

  protected readonly workspace = computed(() => {
    const u = this._session.user();
    return u?.unitId ?? u?.supplier ?? 'Central de operações';
  });

  protected readonly nav = computed(() => {
    const role = this._session.role();
    return role ? NAV_ITEMS.filter((i) => i.roles.includes(role)) : [];
  });

  protected close(): void {
    this.ui.mobileMenu.set(false);
  }

  protected logout(): void {
    this.close();
    this._session.end();
  }
}
