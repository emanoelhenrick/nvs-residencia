import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ITicket } from '../../../../models';
import { Callout } from '../../../../shared/callout/callout';
import { Modal } from '../../../../shared/modal/modal';
import { fmtDateTime } from '../../../../utils/dates';

@Component({
  selector: 'app-ticket-created',
  imports: [RouterLink, Callout, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-created.html',
})
export class TicketCreated {
  readonly ticket = input.required<ITicket>();
  readonly follow = output<void>();
  readonly another = output<void>();

  protected readonly dialog = signal(true);
  protected readonly fmt = fmtDateTime;
}
