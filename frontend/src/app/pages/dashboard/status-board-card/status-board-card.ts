import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TicketStatus } from '../../../models';

@Component({
  selector: 'app-status-board-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card">
    <h2>Status dos {{ total() }} chamados ativos</h2>
    <div class="stack-sm" style="margin-top: 16px">
      @for (s of board(); track s.status) {
        <div class="row-between">
          <span
            class="badge"
            [class.lav]="s.status === 'IN_PROGRESS'"
            [class.amber]="s.status === 'WAITING_REQUESTER' || s.status === 'WAITING_THIRD_PARTY'"
            >{{ s.label }}</span
          >
          <b>{{ s.n }}</b>
        </div>
      }
    </div>
  </div>`,
})
export class StatusBoardCard {
  readonly total = input.required<number>();
  readonly board = input.required<{ status: TicketStatus; label: string; n: number }[]>();
}
