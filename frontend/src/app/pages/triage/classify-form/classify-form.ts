import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROLE_LABEL } from '../../../constants/role.constants';
import { SEVERITY_LABEL } from '../../../constants/ticket.constants';
import { ToastService } from '../../../core/ui/toast.service';
import { IUnit, ITicket, IUser, Severity, TicketScope } from '../../../models';
import { TicketsService } from '../../../services/tickets.service';
import { UsersService } from '../../../services/users.service';
import { Callout } from '../../../shared/callout/callout';
import { Icon } from '../../../shared/icon/icon';
import { errorMessage } from '../../../utils/http';
import { unitLabel } from '../../../utils/unit';
import { ClassifySummary } from './classify-summary/classify-summary';

type ClassifyField = 'severity' | 'urgency' | 'assigneeId' | 'justification';

@Component({
  selector: 'app-classify-form',
  imports: [ReactiveFormsModule, Callout, Icon, ClassifySummary],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './classify-form.html',
})
export class ClassifyForm implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _ticketsService = inject(TicketsService);
  private readonly _usersService = inject(UsersService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly units = input.required<IUnit[]>();
  readonly saved = output<string>();
  readonly changed = output<void>();

  protected readonly users = signal<IUser[]>([]);
  protected readonly severities = Object.keys(SEVERITY_LABEL) as Severity[];
  protected readonly sevLabel = SEVERITY_LABEL;
  protected readonly submitted = signal(false);
  protected readonly busy = signal(false);

  protected readonly form = this._formBuilder.nonNullable.group({
    severity: ['' as Severity | '', Validators.required],
    urgency: ['', [Validators.required, Validators.minLength(10)]],
    scope: ['este' as TicketScope],
    assigneeId: ['', Validators.required],
    justification: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected readonly assignees = computed(() =>
    this.users().map((u) => ({
      id: u.id,
      label: u.supplier ? `${u.supplier} · Fornecedor (${u.name})` : `${u.name} · ${ROLE_LABEL[u.role]}`,
    })),
  );
  protected readonly unit = computed(() => unitLabel(this.units(), this.ticket().unitId));

  constructor() {
    effect(() => {
      const t = this.ticket();
      untracked(() => {
        this.submitted.set(false);
        this.form.reset({
          severity: t.severity ?? '',
          urgency: t.urgency ?? '',
          scope: t.scope ?? 'este',
          assigneeId: '',
          justification: '',
        });
      });
    });
  }

  ngOnInit(): void {
    this._usersService.list({ assignable: true }).subscribe({
      next: (list) => this.users.set(list),
      error: () => this._toastService.show('Não foi possível carregar os responsáveis.', 'error'),
    });
  }

  protected bad(name: ClassifyField): boolean {
    return this.submitted() && this.form.controls[name].invalid;
  }

  protected startTriage(): void {
    this._ticketsService.startTriage(this.ticket().id).subscribe({
      next: () => {
        this._toastService.show(`${this.ticket().id} em triagem.`, 'info');
        this.changed.emit();
      },
      error: (err) => this._toastService.show(errorMessage(err, 'Não foi possível iniciar a triagem.'), 'error'),
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.busy()) return;

    const v = this.form.getRawValue();
    this.busy.set(true);
    this._ticketsService
      .triage(this.ticket().id, {
        severity: v.severity as Severity,
        urgency: v.urgency.trim(),
        scope: v.scope,
        assigneeId: v.assigneeId,
        justification: v.justification.trim(),
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this._toastService.show(`${this.ticket().id} classificado e atribuído. SLA em contagem.`);
          this.saved.emit(this.ticket().id);
        },
        error: (err) => {
          this.busy.set(false);
          this._toastService.show(errorMessage(err, 'Erro ao classificar o chamado.'), 'error');
        },
      });
  }
}
