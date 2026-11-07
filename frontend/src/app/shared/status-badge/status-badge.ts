import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUS_LABEL } from '../../constants/ticket.constants';
import { TicketStatus } from '../../models';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.html',
  styles: [':host { display: inline-flex; }'],
})
export class StatusBadge {
  readonly status = input.required<TicketStatus>();
  readonly override = input('');

  protected readonly label = computed(() => this.override() || STATUS_LABEL[this.status()]);
  protected readonly lav = computed(() => ['IN_PROGRESS', 'RESOLVED'].includes(this.status()));
  protected readonly amber = computed(() =>
    ['WAITING_REQUESTER', 'WAITING_THIRD_PARTY'].includes(this.status()),
  );
}
