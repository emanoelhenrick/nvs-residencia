import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface TimelineEntry {
  date: string;
  author: string;
  action: string;
  details: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss',
})
export class Attendance {
  private fb = inject(FormBuilder);

  public readonly lastUpdated: string = '03/10/2026 às 14:25';
  public readonly ticketId: string = 'NX-2026-01842';

  // Histórico / Timeline
  public readonly timelineLogs: TimelineEntry[] = [
    {
      date: '03/10/2026 · 10:42',
      author: 'Marina Costa',
      action: 'Foto da mensagem de erro solicitada',
      details: 'Status Em atendimento → Aguardando Solicitante. Início de pausa 10:42; fim 11:05.',
    },
    {
      date: '03/10/2026 · 11:05',
      author: 'Ana Silva / Marina Costa',
      action: 'Foto enviada; atendimento retomado',
      details: 'Aguardando Solicitante → Em atendimento. Motivo da pausa preservado; fim registrado às 11:05.',
    },
  ];

  // Formulário de Comentário e Anexo
  public commentForm: FormGroup = this.fb.group({
    commentText: [
      'Foto recebida. Vamos reiniciar o serviço local do PDV-07 e validar uma venda teste com a unidade.',
      [Validators.required],
    ],
  });

  // Formulário de Espera
  public waitForm: FormGroup = this.fb.group({
    esperaState: ['Aguardando Terceiro/Fornecedor', [Validators.required]],
    esperaMotivo: ['', [Validators.required]],
  });

  // Formulário de Resolução
  public resolveForm: FormGroup = this.fb.group({
    solucaoAplicada: ['', [Validators.required]],
  });

  public onPublishComment(): void {
    if (this.commentForm.valid) {
      console.log('Comentário publicado:', this.commentForm.value);
    }
  }

  public onRegisterWait(): void {
    if (this.waitForm.valid) {
      console.log('Espera registrada:', this.waitForm.value);
    }
  }

  public onResolveTicket(): void {
    if (this.resolveForm.valid) {
      console.log('Chamado resolvido:', this.resolveForm.value);
    }
  }

  public onReviewEscalation(): void {
    console.log('Solicitar revisão de escalonamento');
  }

  public onCancelTicket(): void {
    console.log('Cancelar chamado com justificativa');
  }
}