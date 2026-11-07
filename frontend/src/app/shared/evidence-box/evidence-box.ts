import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { fmtDateTime } from '../../utils/dates';
import { Icon } from '../icon/icon';
import { Modal } from '../modal/modal';
import { IEvidence } from '../../models';

@Component({
  selector: 'app-evidence-box',
  imports: [Icon, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evidence-box.html',
  styleUrl: './evidence-box.scss',
})
export class EvidenceBox {
  readonly evidence = input.required<IEvidence>();
  readonly buttonLabel = input('Ver evidência');

  protected readonly open = signal(false);

  protected readonly fmt = fmtDateTime;
}
