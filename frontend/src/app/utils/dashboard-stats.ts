import { BOARD_STATUSES, STATUS_LABEL } from '../constants/ticket.constants';
import { IHistory, ISlaView, ITicket, SlaState, TicketStatus } from '../models';
import { fmtDur } from './dates';
import { slaView } from './sla';
import { isActive } from './ticket';

export interface IDashRow {
  t: ITicket;
  sla: ISlaView;
}

export interface IRecentUpdate {
  t: ITicket;
  h: IHistory;
}

const ATTENTION_RANK: Partial<Record<SlaState, number>> = { violado: 0, atencao: 1, pausado: 2 };

/** Chamados ativos (sem incidentes pai) com a visão de SLA calculada para `now`. */
export const buildRows = (tickets: ITicket[], now: number): IDashRow[] =>
  tickets
    .filter((t) => t.kind === 'chamado' && isActive(t.status))
    .map((t) => ({ t, sla: slaView(t, now) }));

export const countBySla = (rows: IDashRow[], state: SlaState): number =>
  rows.filter((r) => r.sla.state === state).length;

export const countWithinDeadline = (rows: IDashRow[]): number =>
  rows.filter((r) => r.sla.state === 'dentro-prazo' || r.sla.state === 'sem-sla').length;

export const percentOf = (n: number, total: number): number =>
  total ? Math.round((n / total) * 100) : 0;

export function priorityBuckets(rows: IDashRow[]): { label: string; n: number }[] {
  const by = (p: string) => rows.filter((r) => r.t.priority === p).length;
  return [
    { label: 'P1 — Crítica', n: by('P1') },
    { label: 'P2 — Alta', n: by('P2') },
    { label: 'P3 — Média', n: by('P3') },
    { label: 'Outras prioridades (P4)', n: by('P4') + rows.filter((r) => !r.t.priority).length },
  ];
}

export function statusBoard(rows: IDashRow[]): { status: TicketStatus; label: string; n: number }[] {
  return BOARD_STATUSES.map((status) => ({
    status,
    label: STATUS_LABEL[status],
    n: rows.filter((r) => r.t.status === status).length,
  }));
}

export const alertRows = (rows: IDashRow[]): IDashRow[] =>
  rows
    .filter((r) => r.sla.state === 'atencao' || r.sla.state === 'violado')
    .sort((a, b) => (ATTENTION_RANK[a.sla.state] ?? 9) - (ATTENTION_RANK[b.sla.state] ?? 9));

export const attentionRows = (rows: IDashRow[], limit = 3): IDashRow[] =>
  rows
    .filter((r) => r.sla.state in ATTENTION_RANK)
    .sort(
      (a, b) =>
        (ATTENTION_RANK[a.sla.state] ?? 9) - (ATTENTION_RANK[b.sla.state] ?? 9) ||
        b.sla.pct - a.sla.pct,
    )
    .slice(0, limit);

export function recentUpdates(tickets: ITicket[], limit = 3): IRecentUpdate[] {
  return tickets
    .filter((t) => t.history.length)
    .map((t) => ({ t, h: [...t.history].sort((a, b) => b.at.localeCompare(a.at))[0] }))
    .sort((a, b) => b.h.at.localeCompare(a.h.at))
    .slice(0, limit);
}

export const alertTitle = (r: IDashRow): string =>
  r.sla.state === 'violado'
    ? `${r.t.id} · SLA violado · ${fmtDur(r.sla.overMin)} de atraso`
    : `${r.t.id} · ${r.sla.pct}% do TMS consumido · ${fmtDur(r.sla.remainingMin)} restantes`;
