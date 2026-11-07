import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

type Tab = 'resumo' | 'historico' | 'relacionados';

@Component({
  selector: 'app-ticket-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-tabs.html',
})
export class TicketTabs {
  protected readonly tab = signal<Tab>('resumo');
  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'historico', label: 'Histórico' },
    { id: 'relacionados', label: 'Relacionados' },
  ];

  protected go(tab: Tab): void {
    this.tab.set(tab);
    document.getElementById(tab)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
