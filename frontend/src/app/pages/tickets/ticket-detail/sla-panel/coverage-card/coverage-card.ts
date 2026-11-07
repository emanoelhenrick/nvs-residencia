import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ISlaParam } from '../../../../../constants/sla.constants';
import { ITicket } from '../../../../../models';
import { fmtDur, fmtTime } from '../../../../../utils/dates';

@Component({
  selector: 'app-coverage-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coverage-card.html',
})
export class CoverageCard {
  readonly ticket = input.required<ITicket>();
  readonly params = input.required<ISlaParam>();
  readonly respMin = input<number | null>(null);

  protected readonly dur = fmtDur;
  protected readonly time = fmtTime;
  protected readonly preserved = ['REOPENED', 'CLOSED', 'CANCELLED'];
}
