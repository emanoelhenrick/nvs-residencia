import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-selection-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="selbar row">
    <strong>{{ count() }} selecionado(s)</strong>
    <button type="button" class="btn btn-sm" (click)="exportCsv.emit()">Exportar CSV</button>
    <button type="button" class="link" (click)="cleared.emit()">Limpar seleção</button>
  </div>`,
  styles: ['.selbar { margin-bottom: 12px; padding: 8px 12px; background: var(--c-primary-soft); border-radius: 8px; }'],
})
export class SelectionBar {
  readonly count = input.required<number>();
  readonly exportCsv = output<void>();
  readonly cleared = output<void>();
}
