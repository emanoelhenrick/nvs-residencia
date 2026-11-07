import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-classification-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="card">
    <h2 style="margin-bottom: 8px">Classificação do chamado</h2>
    <p>
      A prioridade não pode ser escolhida livremente. A triagem avalia impacto, severidade e
      urgência.
    </p>
    <p class="footnote">
      Regra RN03: Severidade × Urgência. Matriz e níveis de urgência ainda pendentes de validação;
      não calculamos a prioridade neste formulário.
    </p>
  </section>`,
})
export class ClassificationHint {}
