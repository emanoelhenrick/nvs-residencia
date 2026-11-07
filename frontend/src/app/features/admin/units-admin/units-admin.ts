import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToastService } from '../../../core/ui/toast.service';
import { IUnit } from '../../../models';
import { UnitsService } from '../../../services/units.service';
import { errorMessage } from '../../../utils/http';
import { UnitFormModal } from './unit-form-modal/unit-form-modal';
import { UnitTable } from './unit-table/unit-table';
import { UnitDeleteModal } from './unit-delete-modal/unit-delete-modal';

@Component({
  selector: 'app-units-admin',
  imports: [UnitTable, UnitFormModal, UnitDeleteModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './units-admin.html',
})
export class UnitsAdmin {
  private readonly _unitsService = inject(UnitsService);
  private readonly _toastService = inject(ToastService);

  protected readonly units = signal<IUnit[]>([]);
  protected readonly open = signal(false);
  protected readonly editing = signal<IUnit | null>(null);
  protected readonly deleting = signal<IUnit | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this._unitsService.list().subscribe({
      next: (list) => this.units.set(list),
      error: (err) =>
        this._toastService.show(
          errorMessage(err, 'Erro ao carregar a lista de unidades.'),
          'error',
        ),
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.open.set(true);
  }

  protected openEdit(unit: IUnit): void {
    this.editing.set(unit);
    this.open.set(true);
  }

  protected openDelete(unit: IUnit): void {
    this.deleting.set(unit);
  }

  protected onSaved(): void {
    this.open.set(false);
    this.load();
  }

  protected confirmDelete(): void {
    const unit = this.deleting();
    if (!unit) return;

    this._unitsService.delete(unit.id).subscribe({
      next: () => {
        this._toastService.show(`Unidade ${unit.id} removida com sucesso!`);
        this.deleting.set(null);
        this.load(); // Recarrega a tabela
      },
      error: (err) =>
        this._toastService.show(
          errorMessage(err, 'Erro ao excluir a unidade.'),
          'error',
        ),
    });
  }
}
