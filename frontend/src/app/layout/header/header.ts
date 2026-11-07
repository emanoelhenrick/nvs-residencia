import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { injectInterval } from '../../core/clock/inject-interval';
import { SessionStore } from '../../core/session/session.store';
import { UiService } from '../../core/ui/ui.service';
import { INotification } from '../../models';
import { NotificationsService } from '../../services/notifications.service';
import { Icon } from '../../shared/icon/icon';
import { userLabel } from '../../utils/user';
import { NotificationsPanel } from '../notifications-panel/notifications-panel';

const REFRESH_MS = 30_000;

@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, NotificationsPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly ui = inject(UiService);
  private readonly _session = inject(SessionStore);
  private readonly _notificationsService = inject(NotificationsService);
  private readonly _router = inject(Router);

  protected readonly notifications = signal<INotification[]>([]);
  protected readonly unread = computed(() => this.notifications().filter((n) => !n.read).length);
  protected readonly label = computed(() => {
    const u = this._session.user();
    return u ? userLabel(u) : '';
  });

  constructor() {
    this.refresh();
    injectInterval(() => this.refresh(), REFRESH_MS);
  }

  protected refresh(): void {
    this._notificationsService.list().subscribe({
      next: (list) => this.notifications.set(list),
      error: () => {},
    });
  }

  protected toggleNotifications(): void {
    const open = !this.ui.notificationsOpen();
    this.ui.notificationsOpen.set(open);
    if (open) this.refresh();
  }

  protected toggleMenu(): void {
    window.innerWidth <= 900 ? this.ui.mobileMenu.update((v) => !v) : this.ui.toggleSidebar();
  }

  protected open(n: INotification): void {
    this.ui.notificationsOpen.set(false);
    this._router.navigate(['/tickets', n.ticketId]);
    if (!n.read) this._notificationsService.markRead(n.id).subscribe({ next: () => this.refresh() });
  }

  protected readAll(): void {
    this._notificationsService.markAllRead().subscribe({ next: () => this.refresh() });
  }
}
