import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CATEGORIES, EVIDENCE_REQUIRED } from '../../../constants/ticket.constants';
import { SessionStore } from '../../../core/session/session.store';
import { ToastService } from '../../../core/ui/toast.service';
import { IPickedFile, ITicket, IUnit } from '../../../models';
import { TicketsService } from '../../../services/tickets.service';
import { UnitsService } from '../../../services/units.service';
import { Callout } from '../../../shared/callout/callout';
import { ContextCard } from '../../../shared/context-card/context-card';
import { PageHeader } from '../../../shared/page-header/page-header';
import { errorMessage } from '../../../utils/http';
import { unitLabel } from '../../../utils/unit';
import { ClassificationHint } from './classification-hint/classification-hint';
import { EvidenceCard } from './evidence-card/evidence-card';
import { ProblemFields } from './problem-fields/problem-fields';
import { TicketCreated } from './ticket-created/ticket-created';
import { TicketFormGroup } from './ticket-form.types';

@Component({
  selector: 'app-ticket-form',
  imports: [
    ReactiveFormsModule,
    Callout,
    ContextCard,
    PageHeader,
    ProblemFields,
    EvidenceCard,
    ClassificationHint,
    TicketCreated,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss',
})
export class TicketForm implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _ticketsService = inject(TicketsService);
  private readonly _unitsService = inject(UnitsService);
  private readonly _session = inject(SessionStore);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  protected readonly categories = CATEGORIES;
  protected readonly user = this._session.user;
  protected readonly units = signal<IUnit[]>([]);
  protected readonly form: TicketFormGroup = this._formBuilder.nonNullable.group({
    category: ['', Validators.required],
    title: [''],
    description: ['', [Validators.required, Validators.minLength(10)]],
    impact: ['', [Validators.required, Validators.minLength(5)]],
    affectsOthers: [false],
    errorCode: ['', Validators.required],
    unitId: [''],
  });

  protected readonly category = signal('');
  protected readonly evidence = signal<IPickedFile | null>(null);
  protected readonly submitted = signal(false);
  protected readonly busy = signal(false);
  protected readonly created = signal<ITicket | null>(null);
  private readonly _tick = signal(0);

  protected readonly needsUnit = computed(() => !this.user()?.unitId);
  protected readonly evidenceRequired = computed(() => EVIDENCE_REQUIRED.includes(this.category()));
  protected readonly evidenceMissing = computed(() => this.evidenceRequired() && !this.evidence());
  protected readonly requester = computed(() => {
    const u = this.user();
    return u ? `${u.name} · ${u.id}` : '';
  });
  protected readonly where = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (this.needsUnit()) return 'Sem unidade vinculada · informe a unidade abaixo';
    return `${unitLabel(this.units(), u.unitId)} · ${u.device ?? 'sem dispositivo'}`;
  });
  protected readonly errors = computed(() => {
    this._tick();
    const c = this.form.controls;
    const e: string[] = [];
    if (this.needsUnit() && c.unitId.invalid) e.push('unidade');
    if (c.category.invalid) e.push('categoria');
    if (c.description.invalid) e.push('descrição');
    if (c.impact.invalid) e.push('impacto observado');
    if (c.errorCode.invalid) e.push('código de erro');
    if (this.evidenceMissing()) e.push('evidência');
    return e;
  });
  protected readonly showErrors = computed(() => this.submitted() && this.errors().length > 0);

  constructor() {
    this.form.valueChanges.subscribe((v) => {
      this.category.set(v.category ?? '');
      this._tick.update((n) => n + 1);
    });
  }

  ngOnInit(): void {
    if (this.needsUnit()) this.form.controls.unitId.addValidators(Validators.required);
    this.form.controls.unitId.updateValueAndValidity();
    this._unitsService.list().subscribe({ next: (l) => this.units.set(l), error: () => {} });
  }

  protected pick(f: IPickedFile): void {
    this.evidence.set(f);
    this._tick.update((n) => n + 1);
  }

  protected removeEvidence(): void {
    this.evidence.set(null);
    this._tick.update((n) => n + 1);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this._tick.update((n) => n + 1);
    if (this.errors().length || this.busy()) return;

    const { unitId, ...rest } = this.form.getRawValue();
    this.busy.set(true);
    this._ticketsService
      .create({ ...rest, unitId: this.needsUnit() ? unitId : undefined, evidence: this.evidence() })
      .subscribe({
        next: (t) => {
          this.busy.set(false);
          this.created.set(t);
        },
        error: (err) => {
          this.busy.set(false);
          this._toastService.show(errorMessage(err, 'Não foi possível registrar o chamado.'), 'error');
        },
      });
  }

  protected follow(): void {
    const t = this.created();
    if (t) this._router.navigate(['/tickets', t.id]);
  }

  protected back(): void {
    this._router.navigateByUrl('/list-tickets');
  }

  protected another(): void {
    this.created.set(null);
    this.submitted.set(false);
    this.evidence.set(null);
    this.form.reset({ affectsOthers: false });
  }
}
