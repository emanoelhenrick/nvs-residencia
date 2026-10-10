import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ITicketResponse } from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private readonly ticketsService = inject(TicketsService);

  public readonly lastUpdated: string = '03/10/2026 às 14:25';
  public selectAll: boolean = false;
  public tickets: any = [];

  ngOnInit() {
    this.getAllTickets();
  }

  // private getAllTickets() {
  //   this.ticketsService.getAllTickets().subscribe((response: ITicketResponse[]) => {
  //     this.tickets = response;
  //   });
  // }

  private getAllTickets() {
    this.tickets = [
      {
        protocol: 'NX-2026-01841',
        summary: 'Pagamento TEF sem retorno',
        category: 'Pagamentos · S2 Alta',
        assignee: 'Rafael Melo',
        unit: 'Loja 015 · Salvador',
        status: 'Em atendimento',
        statusType: 'service',
        priority: 'P1',
        tmsSituation: '10 min / atendido',
        tmsSolutionText: '20% restante',
        tmsSolutionProgress: 80,
      },
      {
        protocol: 'NX-2026-01842',
        summary: 'Venda não finaliza no terminal',
        category: 'PDV · S2 Alta',
        assignee: 'Marina Costa',
        unit: 'Loja 042 · Recife',
        status: 'Em atendimento',
        statusType: 'service',
        priority: 'P2',
        tmsSituation: '30 min / atendido',
        tmsSolutionText: '02h18min restantes',
        tmsSolutionProgress: 65,
      },
      {
        protocol: 'NX-2026-01843',
        summary: 'Terminal trava ao concluir venda',
        category: 'PDV · S2 Alta',
        assignee: 'Fila N1',
        unit: 'Loja 042 · Recife',
        status: 'Em triagem',
        statusType: 'triage',
        priority: 'P2',
        tmsSituation: 'Em andamento',
        tmsSolutionText: 'Tempo corrido',
        tmsSolutionProgress: 40,
      },
      {
        protocol: 'NX-2026-01844',
        summary: 'Falha na confirmação da venda',
        category: 'PDV · S2 Alta',
        assignee: 'Não atribuído',
        unit: 'Loja 042 · Recife',
        status: 'Aberto',
        statusType: 'open',
        priority: 'P2',
        tmsSituation: 'Aguardando resposta',
        tmsSolutionText: 'Tempo corrido',
        tmsSolutionProgress: 30,
      },
      {
        protocol: 'NX-2026-01839',
        summary: 'Impressora não emite etiquetas',
        category: 'Impressora · S3 Média',
        assignee: 'TecPrint · Fornecedor',
        unit: 'CD 003 · Jaboatão',
        status: 'Aguardando Terceiro/ Fornecedor',
        statusType: 'warning',
        priority: 'P3',
        tmsSituation: 'Atendido',
        tmsSolutionText: 'Pausado · laudo técnico',
        tmsSolutionProgress: 50,
      },
      {
        protocol: 'NX-2026-01838',
        summary: 'Acesso ao portal de serviços',
        category: 'Serviços · S4 Baixa',
        assignee: 'Fila N1',
        unit: 'Loja 028 · Natal',
        status: 'Em triagem',
        statusType: 'triage',
        priority: 'P4',
        tmsSituation: 'Fora da cobertura - Seg-Sex',
        tmsSolutionText: 'Tempo corrido',
        tmsSolutionProgress: 15,
      },
      {
        protocol: 'NX-2026-01837',
        summary: 'Cupom com impressão incompleta',
        category: 'Impressora · S3 Média',
        assignee: 'João Santos',
        unit: 'Loja 009 · Maceió',
        status: 'Resolvido',
        statusType: 'resolved',
        priority: 'P3',
        tmsSituation: 'Concluído',
        tmsSolutionText: 'Concluído',
        tmsSolutionProgress: 100,
      },
      {
        protocol: 'NX-2026-01836',
        summary: 'Atualização de cadastro de acesso',
        category: 'Serviços · S4 Baixa',
        assignee: 'João Santos',
        unit: 'CD 001 · Recife',
        status: 'Fechado',
        statusType: 'closed',
        priority: 'P4',
        tmsSituation: 'Concluído',
        tmsSolutionText: 'Concluído',
        tmsSolutionProgress: 100,
      },
    ];
  }

  public filterForm: FormGroup = this.fb.group({
    search: [''],
    unit: ['Todas'],
    status: ['Todos'],
    priority: ['Todas'],
    assignee: ['Todos'],
    category: ['Todas'],
    period: ['30/09–03/10/2026'],
  });

  public toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.tickets.forEach((ticket: any) => (ticket.selected = this.selectAll));
  }

  public toggleTicketSelection(): void {
    this.selectAll = this.tickets.every((ticket: any) => ticket.selected);
  }

  public applyFilters(): void {
    console.log('Filtros aplicados:', this.filterForm.value);
  }

  public clearFilters(): void {
    this.filterForm.reset({
      search: '',
      unit: 'Todas',
      status: 'Todos',
      priority: 'Todas',
      assignee: 'Todos',
      category: 'Todas',
      period: '30/09–03/10/2026',
    });
  }

  public openNewTicket(): void {
    this.router.navigate(['/new-ticket']);
  }

  public openTicketDetails(protocol: string): void {
    console.log('Navegar para o chamado:', protocol);
  }
}
