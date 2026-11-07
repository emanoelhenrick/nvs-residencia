import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { LockedField } from '../locked-field/locked-field';
import { Icon } from '../icon/icon';
import { Callout } from '../callout/callout';

@Component({
  selector: 'app-justification-modal',
  imports: [FormsModule, Modal, LockedField, Icon, Callout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './justification-modal.html',
})
export class JustificationModal {
  readonly title = input.required<string>();
  readonly intro = input('');
  readonly label = input('Justificativa');
  readonly placeholder = input('Informe o que aconteceu');
  readonly confirmText = input('Confirmar');
  readonly danger = input(false);
  readonly minLength = input(10);
  readonly lockedLabel = input('');
  readonly lockedValue = input('');
  readonly footnote = input('');
  readonly blocked = input('');
  readonly confirmed = output<string>();
  readonly closed = output<void>();

  protected readonly text = signal('');
  protected readonly touched = signal(false);
  protected readonly valid = computed(() => this.text().trim().length >= this.minLength());

  protected submit() {
    this.touched.set(true);
    if (this.valid()) this.confirmed.emit(this.text().trim());
  }
}
