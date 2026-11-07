import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ITicket } from '../../../../models';
import { CommentForm } from '../../../../shared/comment-form/comment-form';
import { fmtDateTime } from '../../../../utils/dates';

@Component({
  selector: 'app-comments-card',
  imports: [CommentForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comments-card.html',
})
export class CommentsCard {
  readonly ticket = input.required<ITicket>();
  readonly editable = input(true);
  readonly placeholder = input('Escreva uma atualização para o atendimento');
  readonly changed = output<void>();
  protected readonly fmt = fmtDateTime;

}
