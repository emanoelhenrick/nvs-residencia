import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../../../../core/session/session.store';
import { ITicket } from '../../../../models';
import { TicketsService } from '../../../../services/tickets.service';
import { fmtTime } from '../../../../utils/dates';
import { groupFor } from '../../../../utils/incident-groups';
import { isStaff } from '../../../../utils/role';

/** Vínculos do chamado: incidente pai e irmãos (confirmados) ou sugestão em análise. */
@Component({
  selector: 'app-related-tickets',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './related-tickets.html',
})
export class RelatedTickets {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _session = inject(SessionStore);

  readonly ticket = input.required<ITicket>();

  protected readonly time = fmtTime;
  protected readonly siblings = signal<ITicket[]>([]);
  protected readonly suggestion = signal<ITicket[]>([]);
  protected readonly staff = computed(() => isStaff(this._session.role()));
  protected readonly linkedBy = computed(
    () =>
      this.ticket().history.find((h) => h.kind === 'link' && h.to.startsWith('Vinculado'))
        ?.author ?? null,
  );
  protected readonly reference = computed(
    () => this.ticket().cancellation?.text.match(/NX-\d{4}-\d{5}/)?.[0] ?? null,
  );
  protected readonly empty = computed(
    () => !this.ticket().parentId && !this.suggestion().length && !this.reference(),
  );

  constructor() {
    effect(() => {
      const t = this.ticket();
      untracked(() => this.load(t));
    });
  }

  private load(t: ITicket): void {
    this.siblings.set([]);
    this.suggestion.set([]);

    if (t.parentId) {
      this._ticketsService.list({ parentId: t.parentId }).subscribe({
        next: (list) => this.siblings.set(list.filter((c) => c.id !== t.id)),
        error: () => {},
      });
      return;
    }
    if (!this.staff()) return;

    this._ticketsService.list({ kind: 'chamado', category: t.category, unitId: t.unitId }).subscribe({
      next: (list) => {
        const g = groupFor(t, list);
        this.suggestion.set(g ? g.tickets.filter((x) => x.id !== t.id) : []);
      },
      error: () => {},
    });
  }
}
