import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pager.html',
  styles: [
    ':host { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; flex-wrap: wrap; gap: 12px; }',
  ],
})
export class Pager {
  readonly page = input.required<number>();
  readonly pages = input.required<number>();
  readonly summary = input.required<string>();
  readonly pageChange = output<number>();
}
