import { ACTIVE_STATUSES } from '../constants/ticket.constants';
import { TicketStatus } from '../models';

export const isActive = (s: TicketStatus): boolean => ACTIVE_STATUSES.includes(s);

/** Há evidência registrada desde o início da pausa atual? (condição para retomar com fornecedor) */
export function hasEvidenceSincePause(t: { sla: { pausedSince: string | null }; evidences: { at: string }[] }): boolean {
  const since = t.sla.pausedSince;
  return !!since && t.evidences.some((e) => e.at >= since);
}
