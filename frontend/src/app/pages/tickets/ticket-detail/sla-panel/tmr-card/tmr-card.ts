import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../../../../../shared/icon/icon';
import { fmtDur } from '../../../../../utils/dates';

@Component({
  selector: 'app-tmr-card',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card tight c">
    <div class="h">
      <app-icon [name]="ok() ? 'check-circle' : 'alert'" [size]="16" />
      <strong>TMR · {{ ok() ? 'atendido' : 'excedido' }}</strong>
    </div>
    <div class="big">Resposta em {{ dur(respMin()) }}</div>
    <div class="small muted">Meta: {{ dur(tmrMin()) }}</div>
  </div>`,
  styleUrl: '../sla-card.scss',
})
export class TmrCard {
  readonly respMin = input.required<number>();
  readonly tmrMin = input.required<number>();
  protected readonly dur = fmtDur;
  protected readonly ok = computed(() => this.respMin() <= this.tmrMin());
}
