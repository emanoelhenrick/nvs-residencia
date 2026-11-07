import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ITicket } from '../../../../models';
import { ActionKind } from '../../../../utils/ticket-banner';
import { CancelModal } from './modals/cancel-modal';
import { EscalationModal } from './modals/escalation-modal';
import { ReopenModal } from './modals/reopen-modal';
import { ResolveModal } from './modals/resolve-modal';
import { ResumeModal } from './modals/resume-modal';
import { SendInfoModal } from './modals/send-info-modal';

/** Exibe o modal da ação escolhida; cada modal chama a API e avisa quando concluiu. */
@Component({
  selector: 'app-ticket-actions',
  imports: [CancelModal, ResolveModal, ReopenModal, EscalationModal, ResumeModal, SendInfoModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-actions.html',
})
export class TicketActions {
  readonly ticket = input.required<ITicket>();
  readonly kind = input.required<ActionKind>();
  readonly now = input.required<number>();
  readonly done = output<void>();
  readonly closed = output<void>();
}
