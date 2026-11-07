import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ITicket } from '../../../models';
import { CommentForm } from '../../../shared/comment-form/comment-form';
import { Icon } from '../../../shared/icon/icon';
import { fmtStamp } from '../../../utils/dates';

interface IEvent {
  at: string;
  kind: 'comment' | 'evidence' | 'status';
  title: string;
  text: string;
}

const STATUS_EVENTS = ['pause', 'resume', 'assign', 'resolve', 'reopen', 'continue'];

@Component({
  selector: 'app-conversation',
  imports: [CommentForm, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './conversation.html',
  styleUrl: './conversation.scss',
})
export class Conversation {
  readonly ticket = input.required<ITicket>();
  readonly editable = input(true);
  readonly changed = output<void>();

  protected readonly stamp = fmtStamp;
  protected readonly events = computed<IEvent[]>(() => {
    const t = this.ticket();
    const ev: IEvent[] = [
      ...t.comments.map((c) => ({ at: c.at, kind: 'comment' as const, title: c.author, text: c.text })),
      ...t.evidences
        .filter((e) => e.kind !== 'inicial')
        .map((e) => ({
          at: e.at,
          kind: 'evidence' as const,
          title: e.by,
          text: `${e.name} · ${e.sizeKb} KB · ${e.note}`,
        })),
      ...t.history
        .filter((h) => STATUS_EVENTS.includes(h.kind))
        .map((h) => ({
          at: h.at,
          kind: 'status' as const,
          title: `${h.from ?? 'Sem registro'} → ${h.to}`,
          text: h.text,
        })),
    ];
    return ev.sort((a, b) => a.at.localeCompare(b.at));
  });
}
