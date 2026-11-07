import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IFirstResponse } from '../../../../models';
import { fmtDateTime } from '../../../../utils/dates';

@Component({
  selector: 'app-first-response-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: './first-response.html',
})
export class FirstResponseCard {
  readonly response = input<IFirstResponse | null>(null);
  protected readonly dt = fmtDateTime;
}
