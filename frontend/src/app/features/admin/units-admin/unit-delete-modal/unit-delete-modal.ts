import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ToastService } from '../../../../core/ui/toast.service';
import { IUnit } from '../../../../models';
import { UnitsService } from '../../../../services/units.service';
import { Modal } from '../../../../shared/modal/modal';
import { errorMessage } from '../../../../utils/http';

@Component({
  selector: 'app-unit-delete-modal',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './unit-delete-modal.html',
  styleUrls: ['./unit-delete-modal.scss']
})
export class UnitDeleteModal {
  private readonly _unitsService = inject(UnitsService);
  private readonly _toastService = inject(ToastService);

  readonly unit = input<IUnit | null>(null);
  readonly deleted = output<void>();
  readonly closed = output<void>();

  protected readonly busy = signal(false);

  protected confirm(): void {
    const u = this.unit();
    if (!u || this.busy()) return;

    this.busy.set(true);
    this._unitsService.delete(u.id).subscribe({
      next: () => {
        this.busy.set(false);
        this._toastService.show(`Unidade ${u.id} removida com sucesso!`);
        this.deleted.emit();
      },
      error: (err) => {
        this.busy.set(false);
        this._toastService.show(
          errorMessage(err, 'Erro ao excluir a unidade na API.'),
          'error',
        );
      },
    });
  }
}