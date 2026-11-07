import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../../core/ui/toast.service';
import { ITicket } from '../../../../../models';
import { TicketsService } from '../../../../../services/tickets.service';
import { JustificationModal } from '../../../../../shared/justification-modal/justification-modal';
import { errorMessage } from '../../../../../utils/http';
import { hasEvidenceSincePause } from '../../../../../utils/ticket';

@Component({
  selector: 'app-resume-modal',
  imports: [JustificationModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-justification-modal
    title="Retomar atendimento"
    intro="O SLA volta a contar de onde parou: consumido e saldo foram preservados durante a pausa."
    label="Motivo da retomada"
    placeholder="Informe o que foi recebido e como o atendimento continua"
    confirmText="Retomar atendimento"
    lockedLabel="Motivo da pausa"
    [lockedValue]="ticket().sla.pauseReason ?? '—'"
    [blocked]="blocked()"
    (confirmed)="confirm($event)"
    (closed)="closed.emit()"
  />`,
})
export class ResumeModal {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly done = output<void>();
  readonly closed = output<void>();
  private readonly _busy = signal(false);

  protected readonly blocked = computed(() =>
    hasEvidenceSincePause(this.ticket())
      ? ''
      : 'Nenhuma evidência recebida desde o início da pausa. Anexe o laudo técnico antes de retomar.',
  );

  protected confirm(text: string): void {
    if (this._busy()) return;
    this._busy.set(true);
    this._ticketsService.resume(this.ticket().id, text).subscribe({
      next: () => {
        this._busy.set(false);
        this._toastService.show('Atendimento retomado. O SLA voltou a contar.');
        this.done.emit();
      },
      error: (err) => {
        this._busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível retomar o atendimento.'), 'error');
      },
    });
  }
}
