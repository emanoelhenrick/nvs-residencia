import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface KpiCard {
  title: string;
  value: number;
  subtext: string;
}

export interface PriorityItem {
  label: string;
  percentage: number;
  count: number;
}

export interface StatusItem {
  label: string;
  count: number;
  type: 'default' | 'triage' | 'service' | 'warning' | 'resolved' | 'closed';
}

export interface AttentionTicket {
  id: string;
  title: string;
  location: string;
  status: string;
  priority: string;
  team: string;
  sla: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private router = inject(Router);

  public readonly lastUpdated: string = '03/10/2026 às 14:25';

  public readonly kpiCards: KpiCard[] = [
    { title: 'Chamados ativos', value: 6, subtext: '8 registros na consulta' },
    { title: 'Em triagem', value: 2, subtext: 'Fila N1 para classificação' },
    { title: 'Alerta de SLA', value: 1, subtext: '80% do TMS atingido' },
    { title: 'SLA pausado', value: 1, subtext: 'Aguardando fornecedor' },
  ];

  public readonly priorities: PriorityItem[] = [
    { label: 'Prioridade P1', percentage: 25, count: 1 },
    { label: 'Prioridade P2', percentage: 65, count: 3 },
    { label: 'Prioridade P3', percentage: 25, count: 1 },
    { label: 'Prioridade P4', percentage: 25, count: 1 },
  ];

  public readonly statusList: StatusItem[] = [
    { label: 'Aberto', count: 1, type: 'default' },
    { label: 'Em triagem', count: 2, type: 'triage' },
    { label: 'Em atendimento', count: 2, type: 'service' },
    { label: 'Aguardando Terceiro/ Fornecedor', count: 1, type: 'warning' },
    { label: 'Resolvido', count: 1, type: 'resolved' },
    { label: 'Fechado', count: 1, type: 'closed' },
  ];

  public readonly attentionTickets: AttentionTicket[] = [
    {
      id: 'NX-2026-01841',
      title: 'Pagamento TEF sem retorno',
      location: 'Loja 015 · Salvador · PDV-03',
      status: 'Em atendimento',
      priority: 'Prioridade P1',
      team: 'Pagamentos · Rafael Melo · S2 Alta',
      sla: 'TMS · 20% do TMS restante',
    },
    {
      id: 'NX-2026-01842',
      title: 'Venda não finaliza no terminal',
      location: 'Loja 042 · Recife · PDV-07',
      status: 'Em atendimento',
      priority: 'Prioridade P2',
      team: 'PDV · Marina Costa · S2 Alta',
      sla: 'TMS · 02h 18min restantes',
    },
  ];

  public navigateToNewTicket(): void {
    this.router.navigate(['/new-ticket']);
  }

  public openTicketDetails(id: string): void {
    console.log('Navegar para o chamado:', id);
  }
}