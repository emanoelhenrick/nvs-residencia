import { Priority, Severity, TicketStatus } from '../models';

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_TRIAGE: 'Em triagem',
  IN_PROGRESS: 'Em atendimento',
  WAITING_REQUESTER: 'Aguardando Solicitante',
  WAITING_THIRD_PARTY: 'Aguardando Terceiro/Fornecedor',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
  REOPENED: 'Reaberto',
};

export const STATUS_ORDER = Object.keys(STATUS_LABEL) as TicketStatus[];

export const ACTIVE_STATUSES: TicketStatus[] = [
  'OPEN',
  'IN_TRIAGE',
  'IN_PROGRESS',
  'WAITING_REQUESTER',
  'WAITING_THIRD_PARTY',
  'REOPENED',
];

export const BOARD_STATUSES: TicketStatus[] = [
  'OPEN',
  'IN_TRIAGE',
  'IN_PROGRESS',
  'WAITING_THIRD_PARTY',
  'WAITING_REQUESTER',
];

export const SEVERITY_LABEL: Record<Severity, string> = {
  S1: 'S1 Crítica',
  S2: 'S2 Alta',
  S3: 'S3 Média',
  S4: 'S4 Baixa',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  P1: 'P1 · Crítica',
  P2: 'P2 · Alta',
  P3: 'P3 · Média',
  P4: 'P4 · Baixa',
};

export const CATEGORIES = ['PDV', 'Pagamentos', 'Impressora', 'Serviços', 'Rede'];
export const EVIDENCE_REQUIRED = ['PDV', 'Pagamentos', 'Impressora'];
export const MIN_JUSTIFICATION = 10;
