import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { injectNow } from '../../core/clock/inject-interval';
import { ToastService } from '../../core/ui/toast.service';
import { ISlaView, ITicket, IUnit, SlaState } from '../../models';
import { TicketsService } from '../../services/tickets.service';
import { UnitsService } from '../../services/units.service';
import { Callout } from '../../shared/callout/callout';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Icon } from '../../shared/icon/icon';
import { PageHeader } from '../../shared/page-header/page-header';
import { fmtDateTime, toIso } from '../../utils/dates';
import { slaView } from '../../utils/sla';
import { isActive } from '../../utils/ticket';
import { KpiCard } from '../dashboard/kpi-card/kpi-card';
import { AttendanceFilters, IAttendanceFilters } from './attendance-filters/attendance-filters';
import { QueueCard } from './queue-card/queue-card';

const ORDER: Record<SlaState, number> = {
  violado: 0,
  atencao: 1,
  'dentro-prazo': 2,
  pausado: 3,
  'sem-sla': 4,
  concluido: 5,
  preservado: 5,
};

interface IQueueRow {
  t: ITicket;
  sla: ISlaView;
}

@Component({
  selector: 'app-attendance',
  imports: [PageHeader, EmptyState, KpiCard, QueueCard, AttendanceFilters, Callout, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss',
})
export class Attendance {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _toastService = inject(ToastService);

  protected readonly now = injectNow();
  protected readonly tickets = signal<ITicket[]>([]);
  protected readonly units = signal<IUnit[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly stamp = signal(fmtDateTime(toIso(Date.now())));
  protected readonly filters = signal<IAttendanceFilters>({ search: '', priority: '', slaState: '', assignee: '' });

  private readonly _all = computed<IQueueRow[]>(() =>
    this.tickets()
      .filter((t) => t.kind === 'chamado' && isActive(t.status) && t.status !== 'OPEN')
      .map((t) => ({ t, sla: slaView(t, this.now()) })),
  );
  protected readonly assignees = computed(() => [...new Set(this._all().map((r) => r.t.assignee))].sort());
  protected readonly rows = computed(() => {
    const f = this.filters();
    const q = f.search.trim().toLowerCase();
    return this._all()
      .filter(
        (r) =>
          (!q || [r.t.id, r.t.title, r.t.unitId, r.t.device].some((v) => v.toLowerCase().includes(q))) &&
          (!f.priority || r.t.priority === f.priority) &&
          (!f.slaState || r.sla.state === f.slaState) &&
          (!f.assignee || r.t.assignee === f.assignee),
      )
      .sort((a, b) => ORDER[a.sla.state] - ORDER[b.sla.state] || b.sla.pct - a.sla.pct);
  });
  protected readonly violated = computed(() => this._all().filter((r) => r.sla.state === 'violado').length);
  protected readonly attention = computed(() => this._all().filter((r) => r.sla.state === 'atencao').length);
  protected readonly working = computed(() => this._all().filter((r) => r.t.status === 'IN_PROGRESS').length);

  constructor() {
    this._unitsService.list().subscribe({ next: (l) => this.units.set(l), error: () => {} });
    this.load();
  }

  protected load(notify = false): void {
    this.loading.set(true);
    this.error.set(false);
    this._ticketsService.list().subscribe({
      next: (list) => {
        this.tickets.set(list);
        this.stamp.set(fmtDateTime(toIso(Date.now())));
        this.loading.set(false);
        if (notify) this._toastService.show('Fila atualizada.', 'info');
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
