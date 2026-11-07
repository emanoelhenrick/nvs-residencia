import { ICaps } from './caps';
import { fmtDateTime, fmtDur } from './dates';
import { ISlaView, ITicket } from '../models';

export type ActionKind =
  | 'cancel'
  | 'resolve'
  | 'reopen'
  | 'escalation'
  | 'resume'
  | 'send-info';

export interface IBanner {
  variant: 'warning' | 'info';
  title: string;
  text: string;
  action?: { label: string; kind: ActionKind };
}

/** Aviso contextual do topo do chamado, derivado do status, do SLA e das capacidades. */
export function buildBanner(t: ITicket, s: ISlaView, c: ICaps): IBanner | null {
  if (t.kind !== 'chamado') return null;
  const paused = t.sla.pausedSince ? fmtDateTime(t.sla.pausedSince) : '';
  switch (t.status) {
    case 'RESOLVED':
      return {
        variant: 'info',
        title: 'Resolvido · acompanhe antes do fechamento',
        text: 'Após mais de 48h sem manifestação, o chamado poderá passar a Fechado. Se o problema continuar, informe no chamado. Resolução e histórico serão preservados.',
        action: c.reopen ? { label: 'Informar que o problema continua', kind: 'reopen' } : undefined,
      };
    case 'WAITING_REQUESTER':
      return {
        variant: 'warning',
        title: 'SLA pausado · Aguardando Solicitante',
        text: `Motivo: ${t.sla.pauseReason}. Início: ${paused}. Fim: em aberto. Não há contagem ativa neste momento.`,
        action: c.sendInfo ? { label: 'Enviar informação', kind: 'send-info' } : undefined,
      };
    case 'WAITING_THIRD_PARTY':
      return {
        variant: 'warning',
        title: 'SLA pausado · Aguardando Terceiro/Fornecedor',
        text: `Motivo: ${t.sla.pauseReason}. Início: ${paused}. Fim: em aberto. Consumido e saldo congelados; o relógio não é reiniciado.`,
        action: c.resume ? { label: 'Retomar atendimento', kind: 'resume' } : undefined,
      };
    case 'REOPENED':
      return {
        variant: 'info',
        title: 'Reaberto · recorrência informada',
        text: 'A manifestação preserva a solução anterior e todo o histórico. SLA consumido preservado; saldo conforme registro. Nenhuma nova prioridade, prazo ou regra de recálculo foi aplicada.',
      };
    case 'CANCELLED':
      return {
        variant: 'info',
        title: 'Cancelado com justificativa · registro preservado',
        text: 'O atendimento deste registro foi cancelado; comentários, evidências e histórico continuam disponíveis. Nenhum dado foi excluído.',
      };
    case 'CLOSED':
      return {
        variant: 'info',
        title: t.closedAuto ? 'Fechado automaticamente · sem manifestação' : 'Fechado',
        text: t.closedAuto
          ? `Fechamento em ${fmtDateTime(t.closedAuto)}, após mais de 48h sem manifestação. Solução, evidências e histórico preservados.`
          : 'Registro encerrado. Solução, evidências e histórico preservados.',
      };
    default:
      break;
  }
  if (s.state === 'violado')
    return {
      variant: 'warning',
      title: 'SLA violado · prazo de solução ultrapassado',
      text: `TMS ultrapassado por ${fmtDur(s.overMin)}. Tempo restante: 0min. Revise o atendimento. A violação não promove severidade nem muda a prioridade ${t.priority}.`,
      action: c.escalate ? { label: 'Revisar escalonamento', kind: 'escalation' } : undefined,
    };
  if (s.state === 'atencao')
    return {
      variant: 'warning',
      title: `${s.pct}% do TMS atingido · ${fmtDur(s.remainingMin)} restantes`,
      text: `Consumido: ${fmtDur(s.consumedMin)} de ${fmtDur(s.tmsMin)}. Revise a necessidade de escalonamento; o alerta não executa ações nem muda severidade ou prioridade.`,
      action: c.escalate ? { label: 'Revisar escalonamento', kind: 'escalation' } : undefined,
    };
  const last = [...t.history].sort((a, b) => b.at.localeCompare(a.at))[0];
  if (t.supplier && t.status === 'IN_PROGRESS' && last?.kind === 'resume')
    return { variant: 'info', title: `Atendimento retomado · ${t.id}`, text: last.text };
  return null;
}
