import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Callout } from '../../../../shared/callout/callout';
import { ActionKind, IBanner } from '../../../../utils/ticket-banner';

@Component({
  selector: 'app-ticket-banner',
  imports: [Callout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-banner.html',
})
export class TicketBanner {
  readonly banner = input.required<IBanner>();
  readonly action = output<ActionKind>();
}
