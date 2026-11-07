import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRIORITY_LABEL, SEVERITY_LABEL } from '../../../constants/ticket.constants';
import { ISlaView, ITicket, IUnit } from '../../../models';
import { SlaBar } from '../../../shared/sla-bar/sla-bar';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { unitLabel } from '../../../utils/unit';

@Component({
  selector: 'app-queue-card',
  imports: [RouterLink, SlaBar, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './queue-card.html',
  styleUrl: './queue-card.scss',
})
export class QueueCard {
  readonly ticket = input.required<ITicket>();
  readonly sla = input.required<ISlaView>();
  readonly units = input.required<IUnit[]>();

  private readonly _inTriage = computed(() => ['OPEN', 'IN_TRIAGE'].includes(this.ticket().status));

  protected readonly unit = computed(() => unitLabel(this.units(), this.ticket().unitId));
  protected readonly prio = computed(() => {
    const p = this.ticket().priority;
    return p ? PRIORITY_LABEL[p] : 'Sem prioridade';
  });
  protected readonly sev = computed(() => {
    const s = this.ticket().severity;
    return s ? SEVERITY_LABEL[s] : '';
  });
  protected readonly tag = computed(() => {
    if (this._inTriage()) return { text: 'Aguardando triagem', cls: 'green' };
    switch (this.sla().state) {
      case 'violado':
        return { text: 'SLA violado', cls: 'red' };
      case 'atencao':
        return { text: '80% do TMS consumido', cls: 'amber' };
      case 'pausado':
        return { text: 'SLA pausado', cls: 'lav' };
      default:
        return { text: 'TMS em andamento', cls: 'green' };
    }
  });
  protected readonly info = computed(() => {
    const t = this.ticket();
    const s = this.sla();
    if (this._inTriage()) return 'Tempo em acompanhamento';
    if (s.state === 'pausado')
      return t.sla.pauseReason ? `Aguardando ${t.sla.pauseReason}` : 'Aguardando retorno';
    return s.label;
  });
  protected readonly infoClass = computed(() =>
    this.sla().state === 'atencao' ? 'amber-t' : this.sla().state === 'violado' ? 'red-t' : '',
  );
}
