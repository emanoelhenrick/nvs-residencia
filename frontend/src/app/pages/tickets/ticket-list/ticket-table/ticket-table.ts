import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SEVERITY_LABEL } from '../../../../constants/ticket.constants';
import { ITicket, IUnit } from '../../../../models';
import { SlaBar } from '../../../../shared/sla-bar/sla-bar';
import { StatusBadge } from '../../../../shared/status-badge/status-badge';
import { slaView, tmrSituation } from '../../../../utils/sla';
import { unitLabel } from '../../../../utils/unit';

@Component({
  selector: 'app-ticket-table',
  imports: [RouterLink, SlaBar, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-table.html',
  styleUrl: './ticket-table.scss',
})
export class TicketTable {
  readonly items = input.required<ITicket[]>();
  readonly units = input.required<IUnit[]>();
  readonly now = input.required<number>();
  readonly selected = input.required<ReadonlySet<string>>();
  readonly selectable = input(true);
  readonly total = input.required<number>();
  readonly toggle = output<string>();
  readonly toggleAll = output<void>();

  protected readonly sev = SEVERITY_LABEL;
  protected readonly allSelected = computed(
    () => this.items().length > 0 && this.items().every((t) => this.selected().has(t.id)),
  );

  protected unit(t: ITicket): string {
    return unitLabel(this.units(), t.unitId);
  }
  protected sla(t: ITicket) {
    return slaView(t, this.now());
  }
  protected tmr(t: ITicket): string {
    return tmrSituation(t, this.now());
  }
}
