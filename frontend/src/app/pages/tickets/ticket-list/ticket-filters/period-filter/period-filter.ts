import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../../../shared/icon/icon';
import { periodLabel } from '../../../../../utils/ticket-filters';

@Component({
  selector: 'app-period-filter',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './period-filter.html',
  styles: [
    '.rel { position: relative; } .chip { cursor: pointer; } .pop { position: absolute; top: 44px; left: 0; z-index: 20; background: #fff; border: 1px solid var(--c-border); border-radius: 8px; box-shadow: var(--shadow); padding: 14px; width: 220px; }',
  ],
})
export class PeriodFilter {
  readonly from = input.required<string>();
  readonly to = input.required<string>();
  readonly fromChange = output<string>();
  readonly toChange = output<string>();

  protected readonly open = signal(false);
  protected readonly label = computed(() => periodLabel({ from: this.from(), to: this.to() }));

  close(): void {
    this.open.set(false);
  }
}
