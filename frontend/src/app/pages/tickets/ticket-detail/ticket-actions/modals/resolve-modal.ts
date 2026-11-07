import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../../core/ui/toast.service';
import { ITicket } from '../../../../../models';
import { TicketsService } from '../../../../../services/tickets.service';
import { JustificationModal } from '../../../../../shared/justification-modal/justification-modal';
import { errorMessage } from '../../../../../utils/http';

@Component({
  selector: 'app-resolve-modal',
  imports: [JustificationModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-justification-modal
    title="Registrar solução"
    intro="A solução fica registrada no chamado e o SLA é concluído. O solicitante poderá informar se o problema continuar."
    label="Solução aplicada"
    placeholder="Descreva o que foi feito para resolver"
    confirmText="Marcar como resolvido"
    [danger]="false"
    (confirmed)="confirm($event)"
    (closed)="closed.emit()"
  />`,
})
export class ResolveModal {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly done = output<void>();
  readonly closed = output<void>();
  private readonly _busy = signal(false);

  protected confirm(text: string): void {
    if (this._busy()) return;
    this._busy.set(true);
    this._ticketsService.resolve(this.ticket().id, text).subscribe({
      next: () => {
        this._busy.set(false);
        this._toastService.show('Chamado resolvido. O SLA foi concluído.');
        this.done.emit();
      },
      error: (err) => {
        this._busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível resolver o chamado.'), 'error');
      },
    });
  }
}
