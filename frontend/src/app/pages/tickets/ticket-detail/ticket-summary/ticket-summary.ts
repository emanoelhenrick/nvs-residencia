import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ToastService } from '../../../../core/ui/toast.service';
import { IPickedFile, ITicket } from '../../../../models';
import { TicketsService } from '../../../../services/tickets.service';
import { EvidenceBox } from '../../../../shared/evidence-box/evidence-box';
import { LockedField } from '../../../../shared/locked-field/locked-field';
import { ICaps } from '../../../../utils/caps';
import { fmtDateTime } from '../../../../utils/dates';
import { errorMessage } from '../../../../utils/http';
import { hasEvidenceSincePause } from '../../../../utils/ticket';
import { ActionKind } from '../../../../utils/ticket-banner';
import { ActionRecordCard } from './action-record-card/action-record-card';
import { PendingRequest } from './pending-request/pending-request';

@Component({
  selector: 'app-ticket-summary',
  imports: [EvidenceBox, LockedField, ActionRecordCard, PendingRequest],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-summary.html',
  styles: [':host { display: flex; flex-direction: column; gap: 16px; }'],
})
export class TicketSummary {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticket = input.required<ITicket>();
  readonly caps = input.required<ICaps>();
  readonly action = output<ActionKind>();
  readonly changed = output<void>();

  protected readonly fmt = fmtDateTime;
  protected readonly solved = computed(
    () =>
      !!this.ticket().resolution && ['RESOLVED', 'CLOSED', 'REOPENED'].includes(this.ticket().status),
  );
  protected readonly initial = computed(() =>
    this.ticket().evidences.find((e) => e.kind === 'inicial'),
  );
  protected readonly shown = computed(() => {
    const t = this.ticket();
    const extra = t.evidences.filter((e) => e.kind !== 'inicial');
    return extra.length ? extra : t.evidences.slice(0, 1);
  });
  protected readonly showPending = computed(() => {
    const t = this.ticket();
    return (
      t.status === 'WAITING_REQUESTER' ||
      (t.status === 'WAITING_THIRD_PARTY' && !hasEvidenceSincePause(t))
    );
  });

  protected attachLaudo(f: IPickedFile): void {
    this._ticketsService.attachEvidence(this.ticket().id, { ...f, kind: 'laudo' }).subscribe({
      next: () => {
        this._toastService.show('Laudo anexado. Agora é possível retomar o atendimento.');
        this.changed.emit();
      },
      error: (err) =>
        this._toastService.show(errorMessage(err, 'Não foi possível anexar o laudo.'), 'error'),
    });
  }
}
