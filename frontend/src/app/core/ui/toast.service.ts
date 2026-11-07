import { Injectable, NgZone, inject, signal } from '@angular/core';
import { IToast } from '../../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _ngZone = inject(NgZone);
  private readonly _timeouts = new Map<number, ReturnType<typeof setTimeout>>();
  private _seq = 0;

  readonly toasts = signal<IToast[]>([]);

  show(text: string, variant: IToast['variant'] = 'success', durationMs = 4500): void {
    const id = ++this._seq;
    this.toasts.update((l) => [...l, { id, text, variant }]);
    this._ngZone.runOutsideAngular(() => {
      this._timeouts.set(
        id,
        setTimeout(() => this._ngZone.run(() => this.dismiss(id)), durationMs),
      );
    });
  }

  dismiss(id: number): void {
    this.toasts.update((l) => l.filter((t) => t.id !== id));
    const timer = this._timeouts.get(id);
    if (timer) clearTimeout(timer);
    this._timeouts.delete(id);
  }
}
