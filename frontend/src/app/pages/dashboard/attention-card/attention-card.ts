import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ISlaView, ITicket, IUnit } from '../../../models';
import { Icon } from '../../../shared/icon/icon';
import { SlaBar } from '../../../shared/sla-bar/sla-bar';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { fmtDur, fmtTime, minutesBetween, toMs } from '../../../utils/dates';
import { unitLabel } from '../../../utils/unit';

@Component({
  selector: 'app-attention-card',
  imports: [RouterLink, Icon, SlaBar, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attention-card.html',
  styleUrl: './attention-card.scss',
})
export class AttentionCard {
  readonly ticket = input.required<ITicket>();
  readonly sla = input.required<ISlaView>();
  readonly units = input.required<IUnit[]>();
  readonly now = input.required<number>();

  protected readonly unit = computed(() => unitLabel(this.units(), this.ticket().unitId));
  protected readonly pausedFor = computed(() => {
    const p = this.ticket().sla.pausedSince;
    return p ? fmtDur(minutesBetween(toMs(p), this.now())) : '';
  });
  protected readonly pausedSince = computed(() => {
    const p = this.ticket().sla.pausedSince;
    return p ? fmtTime(p) : '';
  });
  protected readonly total = computed(() =>
    fmtDur(minutesBetween(toMs(this.ticket().openedAt), this.now())),
  );
  protected readonly text = computed(() => {
    const s = this.sla();
    return s.state === 'violado'
      ? `${fmtDur(s.overMin)} de atraso · SLA violado`
      : `${fmtDur(s.remainingMin)} restantes · SLA em atenção`;
  });
  protected readonly waitHint = computed(() =>
    this.ticket().status === 'WAITING_THIRD_PARTY'
      ? 'Aguardando resposta do fornecedor.'
      : 'Aguardando resposta do solicitante.',
  );
}
