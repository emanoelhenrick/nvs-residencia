import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-list-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="head">
    <h2>{{ count() }} {{ noun() }}</h2>
    <span class="small muted">{{ note() }}</span>
  </div>`,
  styles: ['.head { display: flex; align-items: baseline; gap: 14px; margin: 24px 0 14px; flex-wrap: wrap; }'],
})
export class ListHeading {
  readonly count = input.required<number>();
  readonly supplier = input(false);
  readonly org = input('');
  readonly stamp = input('');

  protected readonly noun = computed(() => {
    const one = this.count() === 1;
    return this.supplier() ? (one ? 'chamado atribuído' : 'chamados atribuídos') : one ? 'chamado' : 'chamados';
  });
  protected readonly note = computed(() =>
    this.supplier()
      ? `Prioridade persistida · consulta restrita a ${this.org()}`
      : `Prioridades persistidas · consulta em ${this.stamp() || '—'}`,
  );
}
