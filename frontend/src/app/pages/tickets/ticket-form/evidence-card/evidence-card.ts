import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IPickedFile } from '../../../../models';
import { FilePicker } from '../../../../shared/file-picker/file-picker';
import { Icon } from '../../../../shared/icon/icon';

@Component({
  selector: 'app-evidence-card',
  imports: [FilePicker, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evidence-card.html',
  styleUrl: './evidence-card.scss',
})
export class EvidenceCard {
  readonly evidence = input<IPickedFile | null>(null);
  readonly required = input(false);
  readonly showError = input(false);
  readonly picked = output<IPickedFile>();
  readonly removed = output<void>();
}
