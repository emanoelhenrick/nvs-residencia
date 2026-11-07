import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ISlaBreakdownItem {
  label: string;
  tone: 'ok' | 'warn' | 'danger' | 'paused';
  n: number;
  pct: number;
}

@Component({
  selector: 'app-sla-breakdown-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card">
    <h2 style="font-size: 16px">SLA por status</h2>
    <p class="hint" style="margin: 6px 0 16px">Visão rápida do tempo.</p>
    <div class="stack-sm">
      @for (i of items(); track i.label) {
        <div>
          <div class="row-between small">
            <span><i class="dot" [class]="'dot ' + i.tone"></i> {{ i.label }}</span>
            <span>{{ i.pct }}% · {{ i.n }}</span>
          </div>
          <div class="progress" [class.ok]="i.tone === 'ok'" [class.warn]="i.tone === 'warn'" [class.danger]="i.tone === 'danger'">
            <i [style.width.%]="i.pct"></i>
          </div>
        </div>
      }
    </div>
  </div>`,
  styles: [
    '.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; } .dot.ok { background: var(--c-ok); } .dot.warn { background: var(--c-warn); } .dot.danger { background: var(--c-danger); } .dot.paused { background: var(--c-primary); }',
  ],
})
export class SlaBreakdownCard {
  readonly items = input.required<ISlaBreakdownItem[]>();
}
