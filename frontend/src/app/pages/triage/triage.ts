import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface QueueTicket {
  id: string;
  title: string;
  status: string;
  timestamp: string;
  pdv: string;
  store?: string;
  selected?: boolean;
}

export interface EvidenceItem {
  id: string;
  description: string;
  timestamp: string;
  store: string;
}

@Component({
  selector: 'app-triage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './triage.html',
  styleUrl: './triage.scss',
})
export class Triage {
  private fb = inject(FormBuilder);

  public readonly lastUpdated: string = '03/10/2026 às 10:33';

  // Fila de chamados
  public queueTickets: QueueTicket[] = [
    {
      id: 'NX-2026-01842',
      title: 'Venda não finaliza no terminal',
      status: 'Em triagem',
      timestamp: '03/10/2026 - 10:20',
      pdv: 'PDV - Loja 042',
      selected: true,
    },
    {
      id: 'NX-2026-01843',
      title: 'Terminal trava ao concluir venda',
      status: 'Aberto',
      timestamp: '03/10/2026 - 10:25',
      pdv: 'PDV - Loja 042',
    },
    {
      id: 'NX-2026-01844',
      title: 'Falha na confirmação da venda',
      status: 'Aberto',
      timestamp: '03/10/2026 - 10:32',
      pdv: 'PDV - Loja 042',
    },
  ];

  // Evidências do incidente
  public evidenceItems: EvidenceItem[] = [
    {
      id: 'NX-2026-01842',
      description: 'PDV-07 - E204 - foto ainda será solicitada',
      timestamp: '03/10/2026 - 10:20',
      store: 'PDV - Loja 042 Recife',
    },
    {
      id: 'NX-2026-01843',
      description: 'PDV-08 - E204 - captura-pdv08.jpg, 390 KB',
      timestamp: '03/10/2026 - 10:25',
      store: 'PDV - Loja 042 Recife',
    },
    {
      id: 'NX-2026-01844',
      description: 'PDV-09 - E204 - relato de falha na confirmação',
      timestamp: '03/10/2026 - 10:32',
      store: 'PDV - Loja 042 Recife',
    },
  ];

  // Formulário Reativo principal
  public triageForm: FormGroup = this.fb.group({
    // Form de Classificação
    severidade: ['S2 Alta', [Validators.required]],
    prioridadePersistida: [{ value: 'P2 - somente leitura', disabled: true }],
    urgenciaContexto: [
      'Venda pendente e fila no caixa desde 10:20; sem alternativa neste terminal.',
      [Validators.required],
    ],
    escopoDispositivo: ['apenas_este', [Validators.required]],
    responsavel: ['Marina Costa - N1', [Validators.required]],
    justificativaClassificacao: [
      'Erro E204 impede a conclusão no PDV-07. Marina fará o diagnóstico; prioridade persistida mantida.',
      [Validators.required],
    ],

    // Form de Vinculação de Incidente
    revisouEvidencias: [false],
    incidentePai: ['NX-2026-01840 - PDV (ilustrativo)', [Validators.required]],
    justificativaVinculo: ['', [Validators.required]],
  });

  public selectTicket(selectedId: string): void {
    this.queueTickets.forEach((t) => (t.selected = t.id === selectedId));
  }

  public onSaveTriage(): void {
    if (this.triageForm.valid) {
      console.log('Triagem salva:', this.triageForm.value);
      alert('Triagem guardada com sucesso!');
    } else {
      this.triageForm.markAllAsTouched();
    }
  }

  public onConfirmLink(): void {
    if (
      this.triageForm.get('justificativaVinculo')?.valid &&
      this.triageForm.get('revisouEvidencias')?.value
    ) {
      console.log('Vínculo confirmado:', this.triageForm.value);
      alert('Vínculo ao incidente confirmado!');
    } else {
      alert('Por favor, revise as evidências e preencha a justificativa do vínculo.');
    }
  }
}
