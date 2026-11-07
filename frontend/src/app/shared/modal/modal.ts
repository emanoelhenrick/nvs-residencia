import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  @HostListener('document:keydown.escape') onEsc() {
    this.closed.emit();
  }

  readonly title = input.required<string>();
  readonly wide = input(false);
  readonly closed = output<void>();
}
