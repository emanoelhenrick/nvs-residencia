import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IGroup, ITicket } from '../../../../models';
import { Modal } from '../../../../shared/modal/modal';
import { fmtTime } from '../../../../utils/dates';

export interface ILinkDecision {
  parentId: string;
  justification: string;
}

@Component({
  selector: 'app-incident-link-modal',
  imports: [FormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-link-modal.html',
})
export class IncidentLinkModal implements OnInit {
  readonly group = input.required<IGroup>();
  readonly parents = input.required<ITicket[]>();
  readonly who = input('');
  readonly busy = input(false);
  readonly confirmed = output<ILinkDecision>();
  readonly closed = output<void>();

  protected readonly parentId = signal('');
  protected readonly reviewed = signal(false);
  protected readonly text = signal('');
  protected readonly touched = signal(false);

  protected readonly validText = computed(() => this.text().trim().length >= 10);
  protected readonly canConfirm = computed(() => this.reviewed() && this.validText() && !!this.parentId());
  protected readonly footnote = computed(
    () =>
      `Filhos: ${this.group()
        .tickets.map((t) => `${t.id.slice(-5)} · ${fmtTime(t.openedAt)}`)
        .join('; ')}. Mesma categoria e loja, em ${this.group().spanMin}min.`,
  );

  ngOnInit(): void {
    this.parentId.set(this.parents()[0]?.id ?? 'novo');
  }

  protected confirm(): void {
    this.touched.set(true);
    if (!this.canConfirm() || this.busy()) return;
    this.confirmed.emit({ parentId: this.parentId(), justification: this.text().trim() });
  }
}
