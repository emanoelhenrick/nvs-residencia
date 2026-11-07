import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/ui/toast.service';
import { ITicket, IUser, WaitKind } from '../../../models';
import { TicketsService } from '../../../services/tickets.service';
import { UsersService } from '../../../services/users.service';
import { errorMessage } from '../../../utils/http';

/** Registro de espera (RN06): pausa o SLA apenas em Aguardando Solicitante ou Terceiro/Fornecedor. */
@Component({
  selector: 'app-wait-card',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wait-card.html',
})
export class WaitCard implements OnInit {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _usersService = inject(UsersService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly enabled = input(false);
  readonly changed = output<void>();

  protected readonly kind = signal<WaitKind>('third-party');
  protected readonly motive = signal('');
  protected readonly supplierId = signal('');
  protected readonly suppliers = signal<IUser[]>([]);
  protected readonly busy = signal(false);

  protected readonly needsSupplier = computed(
    () => this.kind() === 'third-party' && !this.ticket().supplier,
  );
  protected readonly valid = computed(
    () =>
      this.enabled() &&
      this.motive().trim().length >= 10 &&
      (!this.needsSupplier() || !!this.supplierId()),
  );

  ngOnInit(): void {
    if (!this.ticket().supplier) {
      this._usersService.list({ role: 'SUPPLIER', active: true }).subscribe({
        next: (list) => this.suppliers.set(list),
        error: () => {},
      });
    }
  }

  protected submit(): void {
    if (!this.valid() || this.busy()) return;
    this.busy.set(true);
    this._ticketsService
      .wait(this.ticket().id, {
        kind: this.kind(),
        reason: this.motive().trim(),
        supplierId: this.needsSupplier() ? this.supplierId() : undefined,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.motive.set('');
          this.supplierId.set('');
          this._toastService.show(
            'Espera registrada. O SLA foi pausado e o tempo consumido congelado.',
          );
          this.changed.emit();
        },
        error: (err) => {
          this.busy.set(false);
          this._toastService.show(
            errorMessage(err, 'Não foi possível registrar a espera.'),
            'error',
          );
        },
      });
  }
}
