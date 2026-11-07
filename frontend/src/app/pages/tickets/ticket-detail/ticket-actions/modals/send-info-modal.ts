import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../../core/ui/toast.service';
import { IPickedFile, ITicket } from '../../../../../models';
import { TicketsService } from '../../../../../services/tickets.service';
import { FilePicker } from '../../../../../shared/file-picker/file-picker';
import { JustificationModal } from '../../../../../shared/justification-modal/justification-modal';
import { errorMessage } from '../../../../../utils/http';

@Component({
  selector: 'app-send-info-modal',
  imports: [JustificationModal, FilePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-justification-modal
    title="Enviar informação"
    intro="Responda ao pedido do atendimento. Ao enviar, o chamado volta para Em atendimento e o SLA retoma."
    label="Informação para o atendimento"
    placeholder="Descreva a informação solicitada"
    confirmText="Enviar informação"
    lockedLabel="Informação solicitada"
    [lockedValue]="ticket().sla.pauseReason ?? '—'"
    (confirmed)="confirm($event)"
    (closed)="closed.emit()"
  >
    <div style="margin-bottom: 14px">
      @if (file(); as f) {
        <p class="small">
          Anexo: {{ f.name }} · {{ f.sizeKb }} KB
          <button type="button" class="link" (click)="file.set(null)">Remover</button>
        </p>
      } @else {
        <app-file-picker label="Anexar evidência" (picked)="file.set($event)" />
      }
    </div>
  </app-justification-modal>`,
})
export class SendInfoModal {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly done = output<void>();
  readonly closed = output<void>();
  protected readonly file = signal<IPickedFile | null>(null);
  private readonly _busy = signal(false);

  protected confirm(text: string): void {
    if (this._busy()) return;
    this._busy.set(true);
    this._ticketsService.sendInfo(this.ticket().id, { text, evidence: this.file() }).subscribe({
      next: () => {
        this._busy.set(false);
        this._toastService.show('Informação enviada. O atendimento foi retomado.');
        this.done.emit();
      },
      error: (err) => {
        this._busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível enviar a informação.'), 'error');
      },
    });
  }
}
