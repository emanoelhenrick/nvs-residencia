import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

export type CalloutVariant = 'warning' | 'info' | 'success' | 'danger';

const ICON_MAP: Record<CalloutVariant, string> = {
  warning: 'alert',
  danger: 'alert',
  success: 'check-circle',
  info: 'info',
};

@Component({
  selector: 'app-callout',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './callout.html',
  styleUrl: './callout.scss',
})
export class Callout {
  readonly variant = input<CalloutVariant>('info');
  readonly title = input('');

  protected readonly icon = computed(() => ICON_MAP[this.variant()] ?? 'info');
}
