import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRIORITIES } from '../../../../constants/sla.constants';
import { CATEGORIES, STATUS_LABEL, STATUS_ORDER } from '../../../../constants/ticket.constants';
import { SessionStore } from '../../../../core/session/session.store';
import { IFilters, IUnit } from '../../../../models';
import { UsersService } from '../../../../services/users.service';
import { FilterChip, IOption } from '../../../../shared/filter-chip/filter-chip';
import { Icon } from '../../../../shared/icon/icon';
import { isStaff } from '../../../../utils/role';
import { defaultFilters } from '../../../../utils/ticket-filters';
import { PeriodFilter } from './period-filter/period-filter';

@Component({
  selector: 'app-ticket-filters',
  imports: [FormsModule, FilterChip, Icon, PeriodFilter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-filters.html',
  styleUrl: './ticket-filters.scss',
})
export class TicketFilters implements OnInit {
  private readonly _usersService = inject(UsersService);
  private readonly _session = inject(SessionStore);

  readonly applied = input.required<IFilters>();
  readonly units = input.required<IUnit[]>();
  readonly apply = output<IFilters>();
  readonly clear = output<void>();

  private readonly _period = viewChild(PeriodFilter);

  protected readonly draft = signal<IFilters>(defaultFilters());
  protected readonly assigneeNames = signal<string[]>([]);
  protected readonly isSupplier = computed(() => this._session.role() === 'SUPPLIER');
  protected readonly scopeName = computed(() => this._session.user()?.supplier ?? '');
  protected readonly canPickAssignee = computed(() => isStaff(this._session.role()));

  protected readonly unitOptions = computed<IOption[]>(() => {
    const own = this._session.role() === 'REQUESTER' ? this._session.user()?.unitId : null;
    return [
      { value: '', label: 'Todas' },
      ...this.units()
        .filter((u) => !own || u.id === own)
        .map((u) => ({ value: u.id, label: u.id })),
    ];
  });
  protected readonly statuses: IOption[] = [
    { value: '', label: 'Todos' },
    ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
  ];
  protected readonly priorities: IOption[] = [
    { value: '', label: 'Todas' },
    ...PRIORITIES.map((p) => ({ value: p, label: p })),
  ];
  protected readonly categories: IOption[] = [
    { value: '', label: 'Todas' },
    ...CATEGORIES.map((c) => ({ value: c, label: c })),
  ];
  protected readonly assignees = computed<IOption[]>(() => [
    { value: '', label: 'Todos' },
    ...this.assigneeNames().map((a) => ({ value: a, label: a })),
  ]);
  protected readonly placeholder = computed(() =>
    this.isSupplier()
      ? `Buscar nos chamados atribuídos a ${this.scopeName()}`
      : 'Buscar em chamados autorizados',
  );

  ngOnInit(): void {
    this.draft.set({ ...this.applied() });
    if (this.canPickAssignee()) {
      this._usersService.list({ assignable: true }).subscribe({
        next: (users) =>
          this.assigneeNames.set(
            ['Fila N1', ...users.map((u) => (u.role === 'SUPPLIER' ? `${u.supplier} · Fornecedor` : u.name))].sort(),
          ),
        error: () => {},
      });
    }
  }

  protected set<K extends keyof IFilters>(k: K, v: IFilters[K]): void {
    this.draft.update((d) => ({ ...d, [k]: v }));
  }

  protected submit(): void {
    this._period()?.close();
    this.apply.emit({ ...this.draft() });
  }

  protected reset(): void {
    this.draft.set(defaultFilters());
    this._period()?.close();
    this.clear.emit();
  }
}
