import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-locked-field',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './locked-field.html',
  styleUrls: ['./locked-field.scss'],
})
export class LockedField {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
}
