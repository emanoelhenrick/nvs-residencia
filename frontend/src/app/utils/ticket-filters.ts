import { STATUS_LABEL } from '../constants/ticket.constants';
import { IFilters, TicketStatus } from '../models';
import { fmtInputDate } from './dates';

export const defaultFilters = (): IFilters => ({
  search: '',
  unitId: '',
  status: '',
  priority: '',
  assignee: '',
  category: '',
  from: '',
  to: '',
});

export function periodLabel(f: Pick<IFilters, 'from' | 'to'>): string {
  if (!f.from && !f.to) return 'Todo o período';
  const from = f.from ? fmtInputDate(f.from) : '…';
  const to = f.to ? fmtInputDate(f.to) : '…';
  return `${from} – ${to}`;
}

export function summarizeFilters(f: IFilters): string[] {
  const parts: string[] = [];
  if (f.search) parts.push(`Busca “${f.search}”`);
  if (f.unitId) parts.push(f.unitId);
  if (f.status) parts.push(`Status ${STATUS_LABEL[f.status as TicketStatus] ?? f.status}`);
  if (f.priority) parts.push(`Prioridade ${f.priority}`);
  if (f.assignee) parts.push(`Responsável ${f.assignee}`);
  if (f.category) parts.push(`Categoria ${f.category}`);
  if (f.from || f.to) parts.push(`Período ${periodLabel(f)}`);
  return parts;
}
