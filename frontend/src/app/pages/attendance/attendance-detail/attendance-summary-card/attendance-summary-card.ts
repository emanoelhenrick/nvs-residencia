import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SEVERITY_LABEL } from '../../../../constants/ticket.constants';
import { IHistory, ITicket } from '../../../../models';
import { StatusBadge } from '../../../../shared/status-badge/status-badge';
import { fmtDateTime } from '../../../../utils/dates';

@Component({
  selector: 'app-attendance-summary-card',
  imports: [RouterLink, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attendance-summary-card.html',
})
export class AttendanceSummaryCard {
  readonly ticket = input.required<ITicket>();
  readonly line = input.required<string>();
  readonly firstAssign = input<IHistory | null>(null);
  protected readonly sev = SEVERITY_LABEL;
  protected readonly dt = fmtDateTime;
}
