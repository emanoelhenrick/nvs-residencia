import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { fmtStamp } from '../../../../utils/dates';
import { IHistory } from '../../../../models';

@Component({
  selector: 'app-audit-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="card" id="historico">
    <h2>Histórico auditável</h2>
    <p class="hint" style="margin: 4px 0 8px">
      Mais recente primeiro · anterior, novo, autor, data e justificativa preservados · histórico
      imutável
    </p>
    <ul class="timeline">
      @for (h of sorted(); track h.id) {
        <li>
          <div class="meta">{{ stamp(h.at) }} · {{ h.author }}</div>
          <div class="what">{{ h.from ?? 'Sem registro' }} → {{ h.to }}</div>
          <div>{{ h.text }}</div>
        </li>
      } @empty {
        <li class="muted">Sem registros.</li>
      }
    </ul>
  </section>`,
})
export class AuditHistory {
  readonly entries = input.required<IHistory[]>();
  protected readonly sorted = computed(() =>
    [...this.entries()].sort((a, b) => b.at.localeCompare(a.at)),
  );
  protected readonly stamp = fmtStamp;
}
