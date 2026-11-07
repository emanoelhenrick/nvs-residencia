import { DestroyRef, NgZone, Signal, inject, signal } from '@angular/core';

/** Executa `fn` a cada `ms` (fora da zona; só volta à zona ao disparar) até o contexto ser destruído. */
export function injectInterval(fn: () => void, ms: number): void {
  const zone = inject(NgZone);
  inject(DestroyRef).onDestroy(
    zone.runOutsideAngular(() => {
      const id = setInterval(() => zone.run(fn), ms);
      return () => clearInterval(id);
    }),
  );
}

/** Relógio reativo: `Date.now()` atualizado periodicamente, para telas que calculam SLA. */
export function injectNow(ms = 30_000): Signal<number> {
  const now = signal(Date.now());
  injectInterval(() => now.set(Date.now()), ms);
  return now.asReadonly();
}
