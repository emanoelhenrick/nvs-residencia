import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card k"><span class="muted">{{ label() }}</span><strong [class]="tone()">{{ value() }}</strong><span class="small muted">{{ hint() }}</span></div>`,
  styles: [`.k { display: flex; flex-direction: column; gap: 6px; height: 100%; } strong { font-size: 32px; font-weight: 700; color: var(--c-primary-dark); line-height: 1.1; }
    strong.danger { color: var(--c-danger); } strong.warn { color: var(--c-warn); }`],
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly hint = input('');
  readonly tone = input<'default' | 'warn' | 'danger'>('default');
}
