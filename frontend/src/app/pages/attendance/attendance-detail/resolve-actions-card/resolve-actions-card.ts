import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ICaps } from '../../../../utils/caps';
import { ActionKind } from '../../../../utils/ticket-banner';
import { ContinueButton } from '../../../tickets/ticket-detail/continue-button/continue-button';

@Component({
  selector: 'app-resolve-actions-card',
  imports: [ContinueButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resolve-actions-card.html',
})
export class ResolveActionsCard {
  readonly ticketId = input.required<string>();
  readonly caps = input<ICaps | null>(null);
  readonly action = output<ActionKind>();
  readonly changed = output<void>();
}
