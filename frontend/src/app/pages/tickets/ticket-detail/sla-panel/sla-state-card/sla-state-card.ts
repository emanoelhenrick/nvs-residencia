import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ISlaView, ITicket } from '../../../../../models';
import { Icon } from '../../../../../shared/icon/icon';
import { fmtDate, fmtDur, fmtStamp, fmtTime } from '../../../../../utils/dates';

@Component({
  selector: 'app-sla-state-card',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sla-state-card.html',
  styleUrl: '../sla-card.scss',
})
export class SlaStateCard {
  readonly ticket = input.required<ITicket>();
  readonly view = input.required<ISlaView>();
  readonly respMin = input<number | null>(null);

  protected readonly dur = fmtDur;
  protected readonly time = fmtTime;
  protected readonly date = fmtDate;
  protected readonly stamp = fmtStamp;
  protected readonly supplier = computed(() => !!this.ticket().supplier);
  protected readonly concluded = computed(() => {
    const t = this.ticket();
    return t.sla.concludedAt ?? t.resolution?.at ?? '';
  });
}
