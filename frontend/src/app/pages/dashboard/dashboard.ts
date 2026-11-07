import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectInterval, injectNow } from '../../core/clock/inject-interval';
import { SessionStore } from '../../core/session/session.store';
import { ITicket, IUnit } from '../../models';
import { TicketsService } from '../../services/tickets.service';
import { UnitsService } from '../../services/units.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { PageHeader } from '../../shared/page-header/page-header';
import {
  alertRows,
  attentionRows,
  buildRows,
  countBySla,
  countWithinDeadline,
  percentOf,
  priorityBuckets,
  recentUpdates,
  statusBoard,
} from '../../utils/dashboard-stats';
import { fmtDateTime, toIso } from '../../utils/dates';
import { AttentionSection } from './attention-section/attention-section';
import { DashboardKpis } from './dashboard-kpis/dashboard-kpis';
import { PriorityChartCard } from './priority-chart-card/priority-chart-card';
import { RecentUpdates } from './recent-updates/recent-updates';
import { SlaAlert } from './sla-alert/sla-alert';
import { ISlaBreakdownItem, SlaBreakdownCard } from './sla-breakdown-card/sla-breakdown-card';
import { StatusBoardCard } from './status-board-card/status-board-card';

const REFRESH_MS = 60_000;

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    PageHeader,
    EmptyState,
    DashboardKpis,
    SlaAlert,
    PriorityChartCard,
    StatusBoardCard,
    SlaBreakdownCard,
    AttentionSection,
    RecentUpdates,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _session = inject(SessionStore);

  protected readonly now = injectNow();
  protected readonly tickets = signal<ITicket[]>([]);
  protected readonly units = signal<IUnit[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly stamp = signal(fmtDateTime(toIso(Date.now())));

  protected readonly canOpen = computed(() => this._session.role() !== 'SUPPLIER');
  protected readonly rows = computed(() => buildRows(this.tickets(), this.now()));
  protected readonly total = computed(() => this.rows().length);
  protected readonly triage = computed(() => this.rows().filter((r) => r.t.status === 'IN_TRIAGE').length);
  protected readonly attentionCount = computed(() => countBySla(this.rows(), 'atencao'));
  protected readonly violatedCount = computed(() => countBySla(this.rows(), 'violado'));
  protected readonly pausedCount = computed(() => countBySla(this.rows(), 'pausado'));
  protected readonly priorities = computed(() => priorityBuckets(this.rows()));
  protected readonly board = computed(() => statusBoard(this.rows()));
  protected readonly alert = computed(() => alertRows(this.rows())[0] ?? null);
  protected readonly attention = computed(() => attentionRows(this.rows()));
  protected readonly recent = computed(() => recentUpdates(this.tickets()));
  protected readonly breakdown = computed<ISlaBreakdownItem[]>(() => {
    const total = this.total();
    const ok = countWithinDeadline(this.rows());
    const item = (label: string, tone: ISlaBreakdownItem['tone'], n: number) => ({
      label,
      tone,
      n,
      pct: percentOf(n, total),
    });
    return [
      item('Dentro do prazo', 'ok', ok),
      item('Em atenção (≥ 80%)', 'warn', this.attentionCount()),
      item('Violados', 'danger', this.violatedCount()),
      item('Pausados', 'paused', this.pausedCount()),
    ];
  });

  constructor() {
    this._unitsService.list().subscribe({ next: (l) => this.units.set(l), error: () => {} });
    this.load();
    injectInterval(() => this.load(false), REFRESH_MS);
  }

  protected load(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.error.set(false);
    this._ticketsService.list().subscribe({
      next: (list) => {
        this.tickets.set(list);
        this.stamp.set(fmtDateTime(toIso(Date.now())));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
