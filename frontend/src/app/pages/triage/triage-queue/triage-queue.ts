import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ITicket, IUnit } from '../../../models';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { fmtStamp } from '../../../utils/dates';
import { unitLabel } from '../../../utils/unit';

@Component({
  selector: 'app-triage-queue',
  imports: [StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './triage-queue.html',
  styleUrl: './triage-queue.scss',
})
export class TriageQueue {
  readonly items = input.required<ITicket[]>();
  readonly units = input.required<IUnit[]>();
  readonly selectedId = input<string | null>(null);
  readonly select = output<string>();

  protected readonly stamp = fmtStamp;

  protected unit(t: ITicket): string {
    return unitLabel(this.units(), t.unitId);
  }
}
