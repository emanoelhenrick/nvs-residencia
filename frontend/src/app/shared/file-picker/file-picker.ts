import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { IPickedFile } from '../../models';

const MAX_MB = 10;

@Component({
  selector: 'app-file-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-picker.html',
})
export class FilePicker {
  readonly label = input('Selecionar arquivo');
  readonly accept = input('.jpg,.jpeg,.png,.pdf,.txt');
  readonly picked = output<IPickedFile>();
  protected readonly error = signal('');

  protected onChange(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const f = el.files?.[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      this.error.set(`O arquivo excede ${MAX_MB} MB.`);
      el.value = '';
      return;
    }
    this.error.set('');
    this.picked.emit({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) });
    el.value = '';
  }
}
