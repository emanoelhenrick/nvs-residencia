import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IAction } from '../../../../../models';
import { fmtDateTime } from '../../../../../utils/dates';

/** Registro auditável (justificativa de reabertura/cancelamento): texto, autor, data e observação. */
@Component({
  selector: 'app-action-record-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="card">
    <h2>{{ title() }}</h2>
    <p style="margin: 10px 0">{{ record().text }}</p>
    <p class="small">{{ record().by }} · {{ fmt(record().at) }}</p>
    <p class="footnote">{{ footnote() }}</p>
  </section>`,
})
export class ActionRecordCard {
  readonly title = input.required<string>();
  readonly record = input.required<IAction>();
  readonly footnote = input.required<string>();
  protected readonly fmt = fmtDateTime;
}
