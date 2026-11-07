import { STATUS_LABEL } from '../constants/ticket.constants';
import { ITicket } from '../models';

const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;

export function ticketsToCsv(rows: ITicket[]): string {
  return [
    'Protocolo;Resumo;Unidade;Status;Prioridade',
    ...rows.map((t) =>
      [t.id, t.title, t.unitId, STATUS_LABEL[t.status] ?? t.status, t.priority ?? '']
        .map((v) => esc(String(v)))
        .join(';'),
    ),
  ].join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
