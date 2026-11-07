import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SEVERITY_LABEL } from '../../../../constants/ticket.constants';
import { ITicket } from '../../../../models';

@Component({
  selector: 'app-classify-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './classify-summary.html',
})
export class ClassifySummary {
  readonly ticket = input.required<ITicket>();
  readonly unit = input.required<string>();
  readonly start = output<void>();
  protected readonly sevLabel = SEVERITY_LABEL;
}
