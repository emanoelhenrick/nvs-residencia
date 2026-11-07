import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/ui/toast.service';
import { IUnit, UnitType } from '../../../../models';
import { UnitsService } from '../../../../services/units.service';
import { Modal } from '../../../../shared/modal/modal';
import { errorMessage } from '../../../../utils/http';

/** Cadastro (unit = null) ou edição de uma unidade. Chama a API e avisa o pai ao concluir. */
@Component({
  selector: 'app-unit-form-modal',
  imports: [ReactiveFormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './unit-form-modal.html',
})
export class UnitFormModal implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _unitsService = inject(UnitsService);
  private readonly _toastService = inject(ToastService);

  readonly unit = input<IUnit | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();

  protected readonly submitted = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly form = this._formBuilder.nonNullable.group({
    id: ['', [Validators.required]],
    type: ['Loja' as UnitType, [Validators.required]],
    city: ['', [Validators.required]],
    uf: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    manager: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const u = this.unit();
    if (u) {
      this.form.patchValue(u);
      this.form.controls.id.disable();
    }
  }

  protected bad(n: 'id' | 'city' | 'uf' | 'manager'): boolean {
    return this.submitted() && this.form.controls[n].invalid;
  }

  protected save(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid || this.busy()) return;

    const v = this.form.getRawValue();
    const change = {
      type: v.type,
      city: v.city.trim(),
      uf: v.uf.toUpperCase().trim(),
      manager: v.manager.trim(),
    };
    const current = this.unit();

    this.busy.set(true);
    const request$ = current
      ? this._unitsService.update(current.id, change)
      : this._unitsService.create({ id: v.id.trim(), ...change });

    request$.subscribe({
      next: (unit) => {
        this.busy.set(false);
        this._toastService.show(
          `Unidade ${unit.id} ${current ? 'atualizada' : 'cadastrada'} com sucesso!`,
        );
        this.saved.emit();
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err, 'Erro ao salvar a unidade na API.'));
      },
    });
  }
}
