import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ITicket } from '../../../../models';
import { ICaps } from '../../../../utils/caps';
import { ContinueButton } from '../continue-button/continue-button';

@Component({
  selector: 'app-side-actions',
  imports: [ContinueButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-actions.html',
})
export class SideActions {
  readonly ticket = input.required<ITicket>();
  readonly caps = input.required<ICaps>();
  readonly cancel = output<void>();
  readonly changed = output<void>();
}
