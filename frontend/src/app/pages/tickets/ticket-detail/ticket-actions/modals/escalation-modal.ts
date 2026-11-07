import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../../core/ui/toast.service';
import { ITicket } from '../../../../../models';
import { TicketsService } from '../../../../../services/tickets.service';
import { JustificationModal } from '../../../../../shared/justification-modal/justification-modal';
import { errorMessage } from '../../../../../utils/http';
import { slaView } from '../../../../../utils/sla';

@Component({
  selector: 'app-escalation-modal',
  imports: [JustificationModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-justification-modal
    title="Revisar escalonamento"
    intro="Registre a decisão da revisão. Ela não executa ações automáticas nem altera severidade ou prioridade."
    label="Decisão da revisão"
    placeholder="Informe o que foi avaliado e a decisão"
    confirmText="Registrar revisão"
    lockedLabel="SLA atual"
    [lockedValue]="current()"
    (confirmed)="confirm($event)"
    (closed)="closed.emit()"
  />`,
})
export class EscalationModal {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly now = input.required<number>();
  readonly done = output<void>();
  readonly closed = output<void>();
  private readonly _busy = signal(false);

  protected readonly current = computed(() => slaView(this.ticket(), this.now()).label);

  protected confirm(text: string): void {
    if (this._busy()) return;
    this._busy.set(true);
    this._ticketsService.reviewEscalation(this.ticket().id, text).subscribe({
      next: () => {
        this._busy.set(false);
        this._toastService.show('Revisão de escalonamento registrada.');
        this.done.emit();
      },
      error: (err) => {
        this._busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível registrar a revisão.'), 'error');
      },
    });
  }
}
