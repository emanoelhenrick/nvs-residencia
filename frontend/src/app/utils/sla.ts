import { SLA_PARAMS, ATTENTION_PCT } from '../constants/sla.constants';
import { ISlaView, ITicket, SlaState } from '../models';
import { fmtDur, minutesBetween, toMs } from './dates';

export function slaView(t: ITicket, now: number): ISlaView {
  const pr = t.priority;
  const base = {
    priority: pr,
    tmrMin: pr ? SLA_PARAMS[pr].tmr : 0,
    tmsMin: pr ? SLA_PARAMS[pr].tms : 0,
  };
  const run = t.sla.runningSince ? minutesBetween(toMs(t.sla.runningSince), now) : 0;
  const consumed = t.sla.consumedMin + run;

  if (!pr || t.kind !== 'chamado')
    return {
      ...base,
      state: 'sem-sla',
      consumedMin: 0,
      remainingMin: 0,
      overMin: 0,
      pct: 0,
      label: 'Aguardando classificação',
      listLabel: 'Aguardando classificação',
      tone: 'none',
    };

  const remaining = Math.max(0, base.tmsMin - consumed);
  const over = Math.max(0, consumed - base.tmsMin);
  const pct = Math.round((consumed / base.tmsMin) * 100);
  const mk = (
    state: SlaState,
    label: string,
    tone: ISlaView['tone'],
    listLabel = label,
  ): ISlaView => ({
    ...base,
    state,
    consumedMin: consumed,
    remainingMin: remaining,
    overMin: over,
    pct,
    label,
    listLabel,
    tone,
  });

  if (t.status === 'RESOLVED') return mk('concluido', 'Concluído', 'done');
  if (t.status === 'CLOSED' || t.status === 'CANCELLED' || t.status === 'REOPENED')
    return mk(
      'preservado',
      'Concluído',
      'done',
      t.status === 'REOPENED' ? 'Preservado' : 'Concluído',
    );
  if (t.sla.pausedSince) {
    const r = t.sla.pauseReason ?? 'espera';
    return mk('pausado', `Pausado · ${r.length > 34 ? r.slice(0, 33) + '…' : r}`, 'paused');
  }
  if (pct >= 100) return mk('violado', `${fmtDur(over)} de atraso`, 'danger');
  if (pct >= ATTENTION_PCT)
    return mk('atencao', `${fmtDur(remaining)} restantes`, 'warn', `${100 - pct}% restante`);
  return mk(
    'dentro-prazo',
    `${fmtDur(remaining)} restantes`,
    'ok',
    `${fmtDur(remaining, true)} restantes`,
  );
}

export function tmrSituation(t: ITicket, now: number): string {
  if (t.status === 'RESOLVED' || t.status === 'CLOSED' || t.status === 'CANCELLED')
    return 'Concluído';
  if (t.sla.firstResponse)
    return `${fmtDur(minutesBetween(toMs(t.openedAt), toMs(t.sla.firstResponse.at)))} / atendido`;
  if (!t.priority) return 'Aguardando resposta';
  return minutesBetween(toMs(t.openedAt), now) > SLA_PARAMS[t.priority].tmr
    ? 'TMR excedido'
    : 'Em andamento';
}
