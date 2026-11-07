import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SEVERITY_LABEL } from '../../../../constants/ticket.constants';
import { ITicket, IUnit } from '../../../../models';
import { StatusBadge } from '../../../../shared/status-badge/status-badge';
import { fmtDateTime, toIso } from '../../../../utils/dates';
import { unitLabel } from '../../../../utils/unit';

@Component({
  selector: 'app-ticket-header',
  imports: [StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-header.html',
  styles: ['.chips { margin-top: 12px; gap: 8px; }'],
})
export class TicketHeader {
  readonly ticket = input.required<ITicket>();
  readonly units = input.required<IUnit[]>();
  readonly now = input.required<number>();

  protected readonly sev = SEVERITY_LABEL;
  protected readonly isParent = computed(() => this.ticket().kind === 'incidente-pai');
  protected readonly stamp = computed(() => fmtDateTime(toIso(this.now())));
  protected readonly opened = computed(() => fmtDateTime(this.ticket().openedAt));
  protected readonly unit = computed(() => unitLabel(this.units(), this.ticket().unitId));
}
