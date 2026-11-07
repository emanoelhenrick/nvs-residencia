import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../../core/ui/toast.service';
import { ITicket } from '../../../../../models';
import { TicketsService } from '../../../../../services/tickets.service';
import { JustificationModal } from '../../../../../shared/justification-modal/justification-modal';
import { errorMessage } from '../../../../../utils/http';

@Component({
  selector: 'app-reopen-modal',
  imports: [JustificationModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-justification-modal
    title="Informar que o problema continua"
    intro="A solução anterior e o SLA consumido serão preservados; o chamado volta para análise."
    label="Descreva o que continua acontecendo"
    placeholder="Informe o que continua acontecendo"
    confirmText="Reabrir chamado"
    [danger]="false"
    (confirmed)="confirm($event)"
    (closed)="closed.emit()"
  />`,
})
export class ReopenModal {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly done = output<void>();
  readonly closed = output<void>();
  private readonly _busy = signal(false);

  protected confirm(text: string): void {
    if (this._busy()) return;
    this._busy.set(true);
    this._ticketsService.reopen(this.ticket().id, text).subscribe({
      next: () => {
        this._busy.set(false);
        this._toastService.show('Chamado reaberto. Solução anterior preservada.');
        this.done.emit();
      },
      error: (err) => {
        this._busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível reabrir o chamado.'), 'error');
      },
    });
  }
}
