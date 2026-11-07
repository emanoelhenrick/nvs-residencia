import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-priority-chart-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card">
    <h2>Prioridades da fila ativa</h2>
    <p class="hint" style="margin: 6px 0 16px">
      Distribuição dos {{ total() }} chamados ativos por prioridade
    </p>
    <div class="stack-sm">
      @for (p of buckets(); track p.label) {
        <div class="bar-row">
          <span class="badge">{{ p.label }}</span>
          <div class="progress"><i [style.width.%]="(p.n / max()) * 100"></i></div>
          <b>{{ p.n }}</b>
        </div>
      }
    </div>
  </div>`,
  styles: [
    '.bar-row { display: grid; grid-template-columns: 170px 1fr 28px; gap: 12px; align-items: center; } .bar-row b { text-align: right; } @media (max-width: 600px) { .bar-row { grid-template-columns: 1fr 1fr 28px; } }',
  ],
})
export class PriorityChartCard {
  readonly total = input.required<number>();
  readonly buckets = input.required<{ label: string; n: number }[]>();
  protected readonly max = computed(() => Math.max(1, ...this.buckets().map((p) => p.n)));
}
