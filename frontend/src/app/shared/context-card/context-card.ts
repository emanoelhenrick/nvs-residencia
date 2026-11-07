import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LockedField } from '../locked-field/locked-field';

/** Cartão "Contexto capturado": dados somente leitura de quem abre o chamado e onde. */
@Component({
  selector: 'app-context-card',
  imports: [LockedField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './context-card.html',
})
export class ContextCard {
  readonly requester = input.required<string>();
  readonly where = input.required<string>();
}
