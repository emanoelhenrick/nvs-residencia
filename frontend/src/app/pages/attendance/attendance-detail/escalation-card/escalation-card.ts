import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-escalation-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escalation-card.html',
})
export class EscalationCard {
  readonly enabled = input(false);
  readonly review = output<void>();
}
