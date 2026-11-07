import { GROUP_WINDOW_MIN } from '../constants/sla.constants';
import { IGroup, ITicket } from '../models';
import { minutesBetween, toMs } from './dates';
import { isActive } from './ticket';

const eligible = (t: ITicket) =>
  t.kind === 'chamado' && !t.parentId && !t.groupDismissed && isActive(t.status);

/**
 * Sugere possíveis incidentes: chamados ativos, ainda sem vínculo, da mesma
 * categoria e unidade, abertos dentro de uma janela curta. Nunca vincula nada
 * sozinho — a confirmação é sempre humana.
 */
export function suggestGroups(tickets: ITicket[]): IGroup[] {
  const buckets = new Map<string, ITicket[]>();
  for (const t of tickets.filter(eligible)) {
    const k = `${t.category}|${t.unitId}`;
    buckets.set(k, [...(buckets.get(k) ?? []), t]);
  }

  const groups: IGroup[] = [];
  for (const list of buckets.values()) {
    const sorted = [...list].sort((a, b) => a.openedAt.localeCompare(b.openedAt));
    let cluster: ITicket[] = [];
    const flush = () => {
      if (cluster.length >= 2) {
        const first = cluster[0];
        const last = cluster[cluster.length - 1];
        groups.push({
          key: `${first.category}|${first.unitId}|${first.id}`,
          category: first.category,
          unitId: first.unitId,
          tickets: cluster,
          spanMin: minutesBetween(toMs(first.openedAt), toMs(last.openedAt)),
        });
      }
      cluster = [];
    };
    for (const t of sorted) {
      if (
        cluster.length &&
        minutesBetween(toMs(cluster[0].openedAt), toMs(t.openedAt)) > GROUP_WINDOW_MIN
      )
        flush();
      cluster.push(t);
    }
    flush();
  }
  return groups.sort((a, b) => b.tickets.length - a.tickets.length);
}

/** Sugestão que contém o chamado informado (a partir de candidatos da mesma categoria/unidade). */
export function groupFor(ticket: ITicket, candidates: ITicket[]): IGroup | null {
  return suggestGroups(candidates).find((g) => g.tickets.some((t) => t.id === ticket.id)) ?? null;
}
