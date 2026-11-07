import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/ui/toast.service';
import { ITicket } from '../../../../models';
import { TicketsService } from '../../../../services/tickets.service';
import { fmtDateTime } from '../../../../utils/dates';
import { errorMessage } from '../../../../utils/http';

@Component({
  selector: 'app-reassessment-card',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reassessment-card.html',
})
export class ReassessmentCard {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly changed = output<void>();

  protected readonly text = signal('');
  protected readonly busy = signal(false);
  protected readonly valid = computed(() => this.text().trim().length >= 10);
  protected readonly fmt = fmtDateTime;

  protected send(): void {
    if (!this.valid() || this.busy()) return;
    this.busy.set(true);
    this._ticketsService.requestReassessment(this.ticket().id, this.text().trim()).subscribe({
      next: () => {
        this.busy.set(false);
        this.text.set('');
        this._toastService.show('Pedido enviado para a triagem. A prioridade não foi alterada.');
        this.changed.emit();
      },
      error: (err) => {
        this.busy.set(false);
        this._toastService.show(errorMessage(err, 'Não foi possível enviar o pedido.'), 'error');
      },
    });
  }
}
