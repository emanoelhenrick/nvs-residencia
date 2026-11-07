import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SLA_PARAMS } from '../../../../constants/sla.constants';
import { ITicket } from '../../../../models';
import { minutesBetween, toMs } from '../../../../utils/dates';
import { slaView } from '../../../../utils/sla';
import { CoverageCard } from './coverage-card/coverage-card';
import { SlaStateCard } from './sla-state-card/sla-state-card';
import { TmrCard } from './tmr-card/tmr-card';

/** Cartões laterais: TMR, SLA/TMS e cobertura do chamado. */
@Component({
  selector: 'app-sla-panel',
  imports: [TmrCard, SlaStateCard, CoverageCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sla-panel.html',
  styles: [':host { display: flex; flex-direction: column; gap: 14px; }'],
})
export class SlaPanel {
  readonly ticket = input.required<ITicket>();
  readonly now = input.required<number>();

  protected readonly view = computed(() => slaView(this.ticket(), this.now()));
  protected readonly params = computed(() => {
    const p = this.ticket().priority;
    return p ? SLA_PARAMS[p] : null;
  });
  protected readonly respMin = computed(() => {
    const t = this.ticket();
    return t.sla.firstResponse
      ? minutesBetween(toMs(t.openedAt), toMs(t.sla.firstResponse.at))
      : null;
  });
}
