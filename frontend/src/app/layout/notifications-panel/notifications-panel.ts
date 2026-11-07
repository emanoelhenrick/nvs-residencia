import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { INotification } from '../../models';
import { NotificationItem } from './notification-item/notification-item';

@Component({
  selector: 'app-notifications-panel',
  imports: [NotificationItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.scss',
})
export class NotificationsPanel {
  readonly notifications = input.required<INotification[]>();
  readonly opened = output<INotification>();
  readonly readAll = output<void>();
  readonly closed = output<void>();

  protected readonly unread = computed(() => this.notifications().filter((n) => !n.read).length);
}
