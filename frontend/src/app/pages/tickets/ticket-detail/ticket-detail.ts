import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectNow } from '../../../core/clock/inject-interval';
import { SessionStore } from '../../../core/session/session.store';
import { ITicket, IUnit } from '../../../models';
import { TicketsService } from '../../../services/tickets.service';
import { UnitsService } from '../../../services/units.service';
import { ContextCard } from '../../../shared/context-card/context-card';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { capsFor } from '../../../utils/caps';
import { slaView } from '../../../utils/sla';
import { ActionKind, buildBanner } from '../../../utils/ticket-banner';
import { unitLabel } from '../../../utils/unit';
import { AuditHistory } from './audit-history/audit-history';
import { CommentsCard } from './comments-card/comments-card';
import { IncidentView } from './incident-view/incident-view';
import { ReassessmentCard } from './reassessment-card/reassessment-card';
import { RelatedTickets } from './related-tickets/related-tickets';
import { SideActions } from './side-actions/side-actions';
import { SlaPanel } from './sla-panel/sla-panel';
import { TicketActions } from './ticket-actions/ticket-actions';
import { TicketBanner } from './ticket-banner/ticket-banner';
import { TicketHeader } from './ticket-header/ticket-header';
import { TicketSummary } from './ticket-summary/ticket-summary';
import { TicketTabs } from './ticket-tabs/ticket-tabs';

@Component({
  selector: 'app-ticket-detail',
  imports: [
    RouterLink,
    EmptyState,
    ContextCard,
    TicketHeader,
    TicketBanner,
    TicketTabs,
    TicketSummary,
    SlaPanel,
    SideActions,
    CommentsCard,
    ReassessmentCard,
    AuditHistory,
    RelatedTickets,
    IncidentView,
    TicketActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-detail.html',
})
export class TicketDetail {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _session = inject(SessionStore);

  readonly id = input.required<string>();

  protected readonly now = injectNow();
  protected readonly ticket = signal<ITicket | null>(null);
  protected readonly units = signal<IUnit[]>([]);
  protected readonly loading = signal(true);
  protected readonly modal = signal<ActionKind | null>(null);

  protected readonly isParent = computed(() => this.ticket()?.kind === 'incidente-pai');
  protected readonly sla = computed(() => {
    const t = this.ticket();
    return t ? slaView(t, this.now()) : null;
  });
  protected readonly caps = computed(() => {
    const t = this.ticket();
    const s = this.sla();
    return t && s ? capsFor(t, this._session.user(), s) : null;
  });
  protected readonly banner = computed(() => {
    const t = this.ticket();
    const s = this.sla();
    const c = this.caps();
    return t && s && c ? buildBanner(t, s, c) : null;
  });
  protected readonly requester = computed(() => {
    const t = this.ticket();
    return t ? `${t.requester.name} · ${t.requester.id ?? 'ID não informado'}` : '';
  });
  protected readonly where = computed(() => {
    const t = this.ticket();
    return t ? `${unitLabel(this.units(), t.unitId)} · ${t.device}` : '';
  });

  constructor() {
    this._unitsService.list().subscribe({ next: (l) => this.units.set(l), error: () => {} });
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.ticket.set(null);
        this.loading.set(true);
        this.load(id);
      });
    });
  }

  protected reload(): void {
    this.load(this.id());
  }

  protected onActionDone(): void {
    this.modal.set(null);
    this.reload();
  }

  private load(id: string): void {
    this._ticketsService.get(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.loading.set(false);
      },
      error: () => {
        this.ticket.set(null);
        this.loading.set(false);
      },
    });
  }
}
