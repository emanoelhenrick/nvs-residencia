import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONSNAMES } from './icons-names';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.html',
  styleUrls: ['./icon.scss'],
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(18);
  protected readonly paths = computed(() => ICONSNAMES[this.name()] ?? []);
}
