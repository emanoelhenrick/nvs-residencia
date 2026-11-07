import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { injectNow } from '../../core/clock/inject-interval';
import { ITicket, IUnit } from '../../models';
import { TicketsService } from '../../services/tickets.service';
import { UnitsService } from '../../services/units.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { fmtDateTime, toIso } from '../../utils/dates';
import { suggestGroups } from '../../utils/incident-groups';
import { ClassifyForm } from './classify-form/classify-form';
import { IncidentPanel } from './incident-panel/incident-panel';
import { TriageQueue } from './triage-queue/triage-queue';

@Component({
  selector: 'app-triage',
  imports: [PageHeader, EmptyState, TriageQueue, ClassifyForm, IncidentPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './triage.html',
  styleUrl: './triage.scss',
})
export class Triage {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _unitsService = inject(UnitsService);

  protected readonly now = injectNow();
  protected readonly tickets = signal<ITicket[]>([]);
  protected readonly units = signal<IUnit[]>([]);
  protected readonly picked = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly stamp = computed(() => fmtDateTime(toIso(this.now())));
  protected readonly queue = computed(() =>
    this.tickets()
      .filter((t) => t.kind === 'chamado' && (t.status === 'OPEN' || t.status === 'IN_TRIAGE'))
      .sort((a, b) => a.openedAt.localeCompare(b.openedAt)),
  );
  protected readonly selected = computed<ITicket | null>(
    () => this.queue().find((t) => t.id === this.picked()) ?? this.queue()[0] ?? null,
  );
  protected readonly groups = computed(() => suggestGroups(this.tickets()));

  constructor() {
    this._unitsService.list().subscribe({ next: (l) => this.units.set(l), error: () => {} });
    this.load();
  }

  /** Nova consulta à API depois de qualquer alteração (classificação, vínculo, descarte). */
  protected load(): void {
    this._ticketsService.list().subscribe({
      next: (list) => {
        this.tickets.set(list);
        this.error.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected onSaved(): void {
    this.picked.set(null);
    this.load();
  }
}
