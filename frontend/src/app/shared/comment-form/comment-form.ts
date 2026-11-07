import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/ui/toast.service';
import { IPickedFile } from '../../models';
import { TicketsService } from '../../services/tickets.service';
import { errorMessage } from '../../utils/http';
import { FilePicker } from '../file-picker/file-picker';
import { Icon } from '../icon/icon';

/** Formulário de comentário com anexo opcional. Envia à API e avisa o pai para recarregar. */
@Component({
  selector: 'app-comment-form',
  imports: [FormsModule, FilePicker, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-form.html',
  styles: [
    '.evbox { display: flex; gap: 10px; padding: 14px; border: 1px solid var(--c-field); border-radius: 6px; color: var(--c-muted); margin-bottom: 12px; } .evbox strong { color: var(--c-text); }',
  ],
})
export class CommentForm {
  private readonly _ticketsService = inject(TicketsService);
  private readonly _toastService = inject(ToastService);

  readonly ticketId = input.required<string>();
  readonly fieldLabel = input('Adicionar comentário');
  readonly placeholder = input('Escreva uma atualização para o atendimento');
  readonly evidenceTitle = input('Anexar evidência');
  readonly submitLabel = input('Enviar comentário');
  readonly successMessage = input('Comentário registrado.');
  readonly posted = output<void>();

  protected readonly text = signal('');
  protected readonly touched = signal(false);
  protected readonly busy = signal(false);
  protected readonly file = signal<IPickedFile | null>(null);
  protected readonly invalid = computed(() => this.touched() && !this.text().trim());

  protected submit(): void {
    this.touched.set(true);
    if (!this.text().trim() || this.busy()) return;

    this.busy.set(true);
    this._ticketsService
      .comment(this.ticketId(), { text: this.text().trim(), evidence: this.file() })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.text.set('');
          this.file.set(null);
          this.touched.set(false);
          this._toastService.show(this.successMessage());
          this.posted.emit();
        },
        error: (err) => {
          this.busy.set(false);
          this._toastService.show(errorMessage(err, 'Não foi possível enviar o comentário.'), 'error');
        },
      });
  }
}
