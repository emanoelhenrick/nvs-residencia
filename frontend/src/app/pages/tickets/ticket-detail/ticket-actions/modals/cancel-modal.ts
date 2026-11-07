import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../../core/ui/toast.service';
import { ITicket } from '../../../../../models';
import { TicketsService } from '../../../../../services/tickets.service';
import { JustificationModal } from '../../../../../shared/justification-modal/justification-modal';
import { errorMessage } from '../../../../../utils/http';

@Component({
  selector: 'app-cancel-modal',
  imports: [JustificationModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-justification-modal
    title="Cancelar chamado com justificativa"
    intro="O cancelamento preserva o histórico, os comentários e as evidências. Nenhum dado é excluído."
    label="Justificativa do cancelamento"
    placeholder="Informe por que o atendimento está sendo cancelado"
    confirmText="Confirmar cancelamento"
    [danger]="true"
    (confirmed)="confirm($event)"
    (closed)="closed.emit()"
  />`,
})
export class CancelModal {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly done = output<void>();
  readonly closed = output<void>();
  private readonly _busy = signal(false);

  protected confirm(text: string): void {
    if (this._busy()) return;
    this._busy.set(true);
    this._ticketsService.cancel(this.ticket().id, text).subscribe({
      next: () => {
        this._busy.set(false);
        this._toastService.show('Chamado cancelado. Registro e histórico preservados.');
        this.done.emit();
      },
      error: (err) => {
        this._busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível cancelar o chamado.'), 'error');
      },
    });
  }
}
