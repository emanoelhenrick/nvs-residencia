import { ChangeDetectionStrategy, Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROLE_LABEL, ROLES } from '../../../constants/role.constants';
import { ToastService } from '../../../core/ui/toast.service';
import { INewUser, IUnit, Role } from '../../../models';
import { UnitsService } from '../../../services/units.service';
import { UsersService } from '../../../services/users.service';
import { Modal } from '../../../shared/modal/modal';
import { errorMessage } from '../../../utils/http';

@Component({
  selector: 'app-user-modal',
  imports: [ReactiveFormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-modal.html',
})
export class UserModal implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _usersService = inject(UsersService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _toastService = inject(ToastService);

  readonly created = output<void>();
  readonly closed = output<void>();

  protected readonly roles = ROLES;
  protected readonly label = ROLE_LABEL;
  protected readonly units = signal<IUnit[]>([]);
  protected readonly submitted = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly form = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['REQUESTER' as Role, Validators.required],
    unitId: [''],
    supplier: [''],
  });

  ngOnInit(): void {
    this._unitsService.list().subscribe({
      next: (list) => this.units.set(list),
      error: () => this._toastService.show('Erro ao carregar a lista de unidades.', 'error'),
    });
  }

  protected bad(n: 'name' | 'email'): boolean {
    return this.submitted() && this.form.controls[n].invalid;
  }

  protected submit(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid || this.busy()) return;

    const v = this.form.getRawValue();
    if (v.role === 'REQUESTER' && !v.unitId) return this.error.set('Selecione a unidade do usuário.');
    if (v.role === 'SUPPLIER' && !v.supplier.trim()) return this.error.set('Informe o fornecedor.');

    const payload: INewUser = {
      name: v.name.trim(),
      email: v.email.trim(),
      role: v.role,
      ...(v.role === 'REQUESTER' && { unitId: v.unitId }),
      ...(v.role === 'SUPPLIER' && { supplier: v.supplier.trim() }),
    };

    this.busy.set(true);
    this._usersService.create(payload).subscribe({
      next: (user) => {
        this.busy.set(false);
        this._toastService.show(`Usuário ${user.name} cadastrado com sucesso!`);
        this.created.emit();
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err, 'Erro ao cadastrar o usuário na API.'));
      },
    });
  }
}
