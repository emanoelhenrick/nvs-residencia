import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sla-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sla-bar.html',
  styleUrls: ['./sla-bar.scss'],
})
export class SlaBar {
  readonly pct = input(0);
  readonly tone = input<'ok' | 'warn' | 'danger' | 'paused' | 'done' | 'none'>('ok');
  protected readonly width = computed(() => Math.max(0, Math.min(100, this.pct())));
}
