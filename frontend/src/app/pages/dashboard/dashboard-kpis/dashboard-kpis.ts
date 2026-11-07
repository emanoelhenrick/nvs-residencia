import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KpiCard } from '../kpi-card/kpi-card';

@Component({
  selector: 'app-dashboard-kpis',
  imports: [KpiCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="kpis" aria-label="Indicadores">
    <app-kpi-card label="Chamados ativos" [value]="total()" [hint]="total() + ' chamados ativos na fila'" />
    <app-kpi-card label="Em triagem" [value]="triage()" hint="Fila N1 para classificação" />
    <app-kpi-card label="SLA em atenção" [value]="attention()" hint="≥ 80% do prazo consumido" tone="warn" />
    <app-kpi-card
      label="SLA violado"
      [value]="violated()"
      hint="Prazo de solução expirado"
      [tone]="violated() ? 'danger' : 'default'"
    />
    <app-kpi-card label="SLA pausado" [value]="paused()" [hint]="paused() + ' chamado com SLA suspenso'" />
  </section>`,
  styles: ['.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }'],
})
export class DashboardKpis {
  readonly total = input.required<number>();
  readonly triage = input.required<number>();
  readonly attention = input.required<number>();
  readonly violated = input.required<number>();
  readonly paused = input.required<number>();
}
