import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PRIORITIES, SLA_PARAMS } from '../../../constants/sla.constants';
import { Callout } from '../../../shared/callout/callout';
import { fmtDur } from '../../../utils/dates';

@Component({
  selector: 'app-sla-params',
  imports: [Callout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sla-params.html',
})
export class SlaParams {
  protected readonly prios = PRIORITIES;
  protected readonly params = SLA_PARAMS;
  protected readonly dur = fmtDur;
}
