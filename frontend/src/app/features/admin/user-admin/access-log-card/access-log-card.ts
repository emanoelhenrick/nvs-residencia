import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IAccessLog } from '../../../../models';
import { fmtDateTime } from '../../../../utils/dates';

@Component({
  selector: 'app-access-log-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './access-log-card.html',
})
export class AccessLogCard {
  readonly log = input<IAccessLog | null>(null);
  protected readonly stamp = fmtDateTime;
}
