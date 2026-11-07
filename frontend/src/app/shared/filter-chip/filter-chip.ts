import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

export interface IOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-chip',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-chip.html',
})
export class FilterChip {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly options = input.required<IOption[]>();
  readonly changed = output<string>();

  protected current() {
    return this.options().find((o) => o.value === this.value())?.label ?? 'Todos';
  }
}
