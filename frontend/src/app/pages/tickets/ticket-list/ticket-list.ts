import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectNow } from '../../../core/clock/inject-interval';
import { SessionStore } from '../../../core/session/session.store';
import { IFilters, ITicket, IUnit } from '../../../models';
import { TicketsService } from '../../../services/tickets.service';
import { UnitsService } from '../../../services/units.service';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { PageHeader } from '../../../shared/page-header/page-header';
import { Pager } from '../../../shared/pager/pager';
import { downloadCsv, ticketsToCsv } from '../../../utils/csv';
import { fmtDateTime, toIso } from '../../../utils/dates';
import { defaultFilters, summarizeFilters } from '../../../utils/ticket-filters';
import { ListHeading } from './list-heading/list-heading';
import { SelectionBar } from './selection-bar/selection-bar';
import { TicketFilters } from './ticket-filters/ticket-filters';
import { TicketTable } from './ticket-table/ticket-table';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-ticket-list',
  imports: [
    RouterLink,
    PageHeader,
    EmptyState,
    Pager,
    TicketFilters,
    TicketTable,
    ListHeading,
    SelectionBar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-list.html',
})
export class TicketList {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _session = inject(SessionStore);

  protected readonly now = injectNow();
  protected readonly filters = signal<IFilters>(defaultFilters());
  protected readonly units = signal<IUnit[]>([]);
  protected readonly items = signal<ITicket[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly page = signal(1);
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly stamp = signal('');

  protected readonly isSupplier = computed(() => this._session.role() === 'SUPPLIER');
  protected readonly org = computed(() => this._session.user()?.supplier ?? '');
  protected readonly summary = computed(() => summarizeFilters(this.filters()));
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.items().length / PAGE_SIZE)));
  protected readonly pageItems = computed(() =>
    this.items().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  protected readonly pagerSummary = computed(() => {
    const n = this.items().length;
    const range = n ? `${(this.page() - 1) * PAGE_SIZE + 1}–${Math.min(n, this.page() * PAGE_SIZE)}` : '0';
    return `${range} de ${n} ${this.isSupplier() ? 'chamado atribuído' : 'chamados'}`;
  });
  protected readonly subtitle = computed(() =>
    this.isSupplier()
      ? `${this.org()} · Somente chamados atribuídos ao seu perfil · ${this.stamp()}`
      : 'Acompanhe a fila e encontre registros pelo protocolo e pela descrição.',
  );

  constructor() {
    this._unitsService.list().subscribe({ next: (l) => this.units.set(l), error: () => {} });
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this._ticketsService.list(this.filters()).subscribe({
      next: (list) => {
        this.items.set(list);
        this.page.set(Math.min(this.page(), Math.max(1, Math.ceil(list.length / PAGE_SIZE))));
        this.stamp.set(fmtDateTime(toIso(Date.now())));
        this.loading.set(false);
      },
      error: () => {
        this.stamp.set(fmtDateTime(toIso(Date.now())));
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected apply(f: IFilters): void {
    this.filters.set(f);
    this.page.set(1);
    this.selected.set(new Set());
    this.load();
  }

  protected clear(): void {
    this.apply(defaultFilters());
  }

  protected go(p: number): void {
    this.page.set(Math.min(this.pages(), Math.max(1, p)));
  }

  protected toggle(id: string): void {
    this.selected.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  protected toggleAll(): void {
    const ids = this.pageItems().map((t) => t.id);
    this.selected.update((s) => {
      const n = new Set(s);
      const all = ids.every((i) => n.has(i));
      ids.forEach((i) => (all ? n.delete(i) : n.add(i)));
      return n;
    });
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected exportCsv(): void {
    const rows = this.items().filter((t) => this.selected().has(t.id));
    downloadCsv('chamados-selecionados.csv', ticketsToCsv(rows));
  }
}
