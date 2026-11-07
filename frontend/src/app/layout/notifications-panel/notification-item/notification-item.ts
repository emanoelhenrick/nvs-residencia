import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { INotification } from '../../../models';
import { Icon } from '../../../shared/icon/icon';
import { fmtStamp } from '../../../utils/dates';

@Component({
  selector: 'app-notification-item',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-item.html',
  styleUrls: ['./notification-item.scss'],
})
export class NotificationItem {
  readonly notification = input.required<INotification>();
  readonly opened = output<INotification>();
  protected readonly fmt = fmtStamp;
}
