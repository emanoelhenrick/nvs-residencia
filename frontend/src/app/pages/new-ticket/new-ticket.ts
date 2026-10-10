import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { IFileEvidence } from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-new-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './new-ticket.html',
  styleUrl: './new-ticket.scss',
})
export class NewTicket {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private ticketsService = inject(TicketsService);

  public attachedFile: IFileEvidence | null = null;

  public ticketForm: FormGroup = this.fb.group({
    requester: [{ value: 'Ana Silva - USR-02518', disabled: true }],
    unit: [{ value: 'Loja 042 · Recife - PDV-07', disabled: true }],
    category: [null, [Validators.required]],
    summary: [null],
    description: [null, [Validators.required]],
    impact: [null, [Validators.required]],
    affectOtherDevices: [false],
    errorCode: [null, [Validators.required]],
  });

  public onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.attachedFile = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        description: 'arquivo anexado',
      };
    }
  }

  public removeFile(): void {
    this.attachedFile = null;
  }

  public onBack(): void {
    this.location.back();
  }

  public onSubmit(): void {
    if (this.ticketForm.valid) {
      const payload = {
        ...this.ticketForm.getRawValue(),
        evidencia: this.attachedFile,
      };

      this.ticketsService.postTicket(payload);
    } else {
      this.ticketForm.markAllAsTouched();
    }
  }
}
