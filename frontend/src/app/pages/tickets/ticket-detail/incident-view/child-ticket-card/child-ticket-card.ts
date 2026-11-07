import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IGroupDecision, ITicket } from '../../../../../models';
import { Icon } from '../../../../../shared/icon/icon';
import { StatusBadge } from '../../../../../shared/status-badge/status-badge';
import { fmtDateTime, fmtTime } from '../../../../../utils/dates';

@Component({
  selector: 'app-child-ticket-card',
  imports: [RouterLink, Icon, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './child-ticket-card.html',
  styleUrl: './child-ticket-card.scss',
})
export class ChildTicketCard {
  readonly child = input.required<ITicket>();
  readonly parentId = input.required<string>();
  readonly group = input<IGroupDecision | null>(null);
  protected readonly fmt = fmtDateTime;
  protected readonly time = fmtTime;
}
