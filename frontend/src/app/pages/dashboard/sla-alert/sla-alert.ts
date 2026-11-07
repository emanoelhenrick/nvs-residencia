import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Callout } from '../../../shared/callout/callout';
import { IDashRow, alertTitle } from '../../../utils/dashboard-stats';

@Component({
  selector: 'app-sla-alert',
  imports: [RouterLink, Callout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@let a = row();
    <app-callout variant="warning" [title]="title()">
      {{ a.t.title }} · {{ a.t.unitId }}.
      {{ a.sla.state === 'violado' ? 'Prazo de solução ultrapassado.' : 100 - a.sla.pct + '% do prazo de solução restante.' }}
      Revise a necessidade de escalonamento.
      <a actions [routerLink]="['/tickets', a.t.id]" class="btn btn-sm">Ver chamado</a>
    </app-callout>`,
})
export class SlaAlert {
  readonly row = input.required<IDashRow>();
  protected readonly title = computed(() => alertTitle(this.row()));
}
