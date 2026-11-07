import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { ITicket } from '../../../../models';
import { TicketsService } from '../../../../services/tickets.service';
import { Callout } from '../../../../shared/callout/callout';
import { ChildTicketCard } from './child-ticket-card/child-ticket-card';
import { GroupDecisionCard } from './group-decision-card/group-decision-card';

@Component({
  selector: 'app-incident-view',
  imports: [Callout, GroupDecisionCard, ChildTicketCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-view.html',
  styles: [':host { display: flex; flex-direction: column; gap: 16px; }'],
})
export class IncidentView {
  private readonly _ticketsService = inject(TicketsService);

  readonly ticket = input.required<ITicket>();
  protected readonly children = signal<ITicket[]>([]);
  protected readonly loaded = signal(false);

  constructor() {
    effect(() => {
      const id = this.ticket().id;
      untracked(() =>
        this._ticketsService.list({ parentId: id }).subscribe({
          next: (list) => {
            this.children.set(list);
            this.loaded.set(true);
          },
          error: () => this.loaded.set(true),
        }),
      );
    });
  }
}
