import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../core/ui/toast.service';
import { TicketsService } from '../../../../services/tickets.service';
import { errorMessage } from '../../../../utils/http';

/** "Continuar atendimento" de um chamado reaberto (usado no detalhe e no atendimento). */
@Component({
  selector: 'app-continue-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" class="btn" [class.btn-primary]="primary()" [disabled]="busy()" (click)="run()">
    Continuar atendimento
  </button>`,
})
export class ContinueButton {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticketId = input.required<string>();
  readonly primary = input(false);
  readonly done = output<void>();
  protected readonly busy = signal(false);

  protected run(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this._ticketsService.continueAttendance(this.ticketId()).subscribe({
      next: () => {
        this.busy.set(false);
        this._toastService.show('Atendimento continuado. O SLA voltou a contar.');
        this.done.emit();
      },
      error: (err) => {
        this.busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível continuar o atendimento.'), 'error');
      },
    });
  }
}
