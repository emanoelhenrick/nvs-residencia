import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ITicket, IPickedFile } from '../../../../../models';
import { FilePicker } from '../../../../../shared/file-picker/file-picker';
import { Icon } from '../../../../../shared/icon/icon';
import { ICaps } from '../../../../../utils/caps';
import { fmtTime } from '../../../../../utils/dates';

/** Pendência que mantém o SLA pausado: informação do solicitante ou laudo do fornecedor. */
@Component({
  selector: 'app-pending-request',
  imports: [FilePicker, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pending-request.html',
  styles: [
    '.pending { display: flex; gap: 10px; margin-top: 14px; padding: 14px; border: 1px solid #9a3412; border-radius: 6px; color: #9a3412; }',
  ],
})
export class PendingRequest {
  readonly ticket = input.required<ITicket>();
  readonly caps = input.required<ICaps>();
  readonly sendInfo = output<void>();
  readonly laudo = output<IPickedFile>();
  protected readonly time = fmtTime;
}
