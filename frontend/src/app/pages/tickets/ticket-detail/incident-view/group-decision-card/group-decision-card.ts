import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IGroupDecision } from '../../../../../models';
import { fmtDateTime } from '../../../../../utils/dates';

@Component({
  selector: 'app-group-decision-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="card" id="resumo">
    <h2 style="margin-bottom: 12px">Decisão de agrupamento</h2>
    <p>{{ group().criterion }}</p>
    <p class="small" style="margin: 12px 0">Evidências conferidas: {{ group().evidenceNote }}.</p>
    <p>Justificativa: {{ group().text }}</p>
    <p class="footnote">Confirmado por {{ group().by }} · {{ fmt(group().at) }}</p>
  </section>`,
})
export class GroupDecisionCard {
  readonly group = input.required<IGroupDecision>();
  protected readonly fmt = fmtDateTime;
}
