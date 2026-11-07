import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStore } from '../../../core/session/session.store';
import { ToastService } from '../../../core/ui/toast.service';
import { IGroup, ITicket, IUnit } from '../../../models';
import { TicketsService } from '../../../services/tickets.service';
import { JustificationModal } from '../../../shared/justification-modal/justification-modal';
import { errorMessage } from '../../../utils/http';
import { unitLabel } from '../../../utils/unit';
import { userLabel } from '../../../utils/user';
import { IncidentEvidenceReview } from './incident-evidence-review/incident-evidence-review';
import { ILinkDecision, IncidentLinkModal } from './incident-link-modal/incident-link-modal';
import { IncidentSuggestionCard } from './incident-suggestion-card/incident-suggestion-card';

@Component({
  selector: 'app-incident-panel',
  imports: [IncidentSuggestionCard, IncidentEvidenceReview, IncidentLinkModal, JustificationModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-panel.html',
  styles: [':host { display: flex; flex-direction: column; gap: 16px; }'],
})
export class IncidentPanel implements OnInit {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _session = inject(SessionStore);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly group = input.required<IGroup>();
  readonly units = input.required<IUnit[]>();
  readonly changed = output<void>();

  protected readonly parents = signal<ITicket[]>([]);
  protected readonly reviewing = signal(false);
  protected readonly linking = signal(false);
  protected readonly discarding = signal(false);
  protected readonly busy = signal(false);

  protected readonly unit = computed(() => unitLabel(this.units(), this.group().unitId));
  protected readonly who = computed(() => {
    const u = this._session.user();
    return u ? userLabel(u) : '';
  });

  ngOnInit(): void {
    const g = this.group();
    this._ticketsService.list({ kind: 'incidente-pai', category: g.category, unitId: g.unitId }).subscribe({
      next: (list) => this.parents.set(list),
      error: () => {},
    });
  }

  protected link(decision: ILinkDecision): void {
    this.busy.set(true);
    this._ticketsService
      .linkIncident({
        childIds: this.group().tickets.map((t) => t.id),
        parentId: decision.parentId,
        justification: decision.justification,
      })
      .subscribe({
        next: ({ parentId }) => {
          this.busy.set(false);
          this.linking.set(false);
          this._toastService.show(
            `Vínculo confirmado ao incidente ${parentId}. Status, severidade e prioridade dos filhos foram mantidos.`,
          );
          this._router.navigate(['/tickets', parentId]);
        },
        error: (err) => {
          this.busy.set(false);
          this._toastService.show(errorMessage(err, 'Não foi possível confirmar o vínculo.'), 'error');
        },
      });
  }

  protected discard(justification: string): void {
    if (this.busy()) return;
    this.busy.set(true);
    this._ticketsService
      .discardIncident({ childIds: this.group().tickets.map((t) => t.id), justification })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.discarding.set(false);
          this._toastService.show('Sugestão descartada com justificativa registrada no histórico.', 'info');
          this.changed.emit();
        },
        error: (err) => {
          this.busy.set(false);
          this._toastService.show(errorMessage(err, 'Não foi possível descartar a sugestão.'), 'error');
        },
      });
  }
}
