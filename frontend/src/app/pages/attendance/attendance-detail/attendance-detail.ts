import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectNow } from '../../../core/clock/inject-interval';
import { SessionStore } from '../../../core/session/session.store';
import { ITicket, IUnit } from '../../../models';
import { TicketsService } from '../../../services/tickets.service';
import { UnitsService } from '../../../services/units.service';
import { Callout } from '../../../shared/callout/callout';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { PageHeader } from '../../../shared/page-header/page-header';
import { capsFor } from '../../../utils/caps';
import { fmtDateTime, toIso } from '../../../utils/dates';
import { isStaff } from '../../../utils/role';
import { slaView } from '../../../utils/sla';
import { ActionKind } from '../../../utils/ticket-banner';
import { unitLabel } from '../../../utils/unit';
import { SlaPanel } from '../../tickets/ticket-detail/sla-panel/sla-panel';
import { TicketActions } from '../../tickets/ticket-detail/ticket-actions/ticket-actions';
import { Conversation } from '../conversation/conversation';
import { WaitCard } from '../wait-card/wait-card';
import { AttendanceSummaryCard } from './attendance-summary-card/attendance-summary-card';
import { EscalationCard } from './escalation-card/escalation-card';
import { FirstResponseCard } from './first-response-card/first-response-card';
import { ResolveActionsCard } from './resolve-actions-card/resolve-actions-card';

@Component({
  selector: 'app-attendance-detail',
  imports: [
    RouterLink,
    Callout,
    EmptyState,
    PageHeader,
    SlaPanel,
    TicketActions,
    Conversation,
    WaitCard,
    AttendanceSummaryCard,
    FirstResponseCard,
    EscalationCard,
    ResolveActionsCard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attendance-detail.html',
  styleUrl: './attendance-detail.scss',
})
export class AttendanceDetail {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _session = inject(SessionStore);

  readonly id = input.required<string>();

  protected readonly now = injectNow();
  protected readonly ticket = signal<ITicket | null>(null);
  protected readonly units = signal<IUnit[]>([]);
  protected readonly loading = signal(true);
  protected readonly modal = signal<ActionKind | null>(null);

  protected readonly canWait = computed(() => isStaff(this._session.role()));
  protected readonly sla = computed(() => {
    const t = this.ticket();
    return t ? slaView(t, this.now()) : null;
  });
  protected readonly caps = computed(() => {
    const t = this.ticket();
    const s = this.sla();
    return t && s ? capsFor(t, this._session.user(), s) : null;
  });
  protected readonly stamp = computed(() => fmtDateTime(toIso(this.now())));
  protected readonly inTriage = computed(() => {
    const s = this.ticket()?.status;
    return s === 'OPEN' || s === 'IN_TRIAGE';
  });
  protected readonly line = computed(() => {
    const t = this.ticket();
    if (!t) return '';
    const code = t.errorCode && t.errorCode !== '—' ? ` · Código ${t.errorCode}` : '';
    return `${t.requester.name} · ${t.requester.id ?? 'ID não informado'} · ${unitLabel(this.units(), t.unitId)} · ${t.device} · Categoria ${t.category}${code}. ${t.impact}`;
  });
  protected readonly firstAssign = computed(
    () => this.ticket()?.history.find((h) => h.kind === 'assign') ?? null,
  );

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
