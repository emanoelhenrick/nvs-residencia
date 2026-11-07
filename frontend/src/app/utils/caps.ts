import { ISlaView, ITicket, IUser } from '../models';
import { isStaff } from './role';
import { isActive } from './ticket';

/** O que o usuário pode fazer sobre um chamado (o escopo de visão já é filtrado pela API). */
export interface ICaps {
  attendant: boolean;
  comment: boolean;
  reassess: boolean;
  cancel: boolean;
  resolve: boolean;
  wait: boolean;
  reopen: boolean;
  continue: boolean;
  sendInfo: boolean;
  resume: boolean;
  attachLaudo: boolean;
  escalate: boolean;
}

const NONE: ICaps = {
  attendant: false,
  comment: false,
  reassess: false,
  cancel: false,
  resolve: false,
  wait: false,
  reopen: false,
  continue: false,
  sendInfo: false,
  resume: false,
  attachLaudo: false,
  escalate: false,
};

export function capsFor(t: ITicket, u: IUser | null, sla: ISlaView): ICaps {
  if (!u || t.kind !== 'chamado') return NONE;
  const staff = isStaff(u.role);
  const requester = u.role === 'REQUESTER';
  const supplier = u.role === 'SUPPLIER';
  const s = t.status;
  const active = isActive(s);
  return {
    attendant: staff || supplier,
    comment: s !== 'CLOSED' && s !== 'CANCELLED',
    reassess: (requester || staff) && active && s !== 'OPEN',
    cancel: staff && active,
    resolve: (staff || supplier) && s === 'IN_PROGRESS',
    wait: staff && s === 'IN_PROGRESS',
    reopen: (requester || staff) && s === 'RESOLVED',
    continue: staff && s === 'REOPENED',
    sendInfo: (requester || staff) && s === 'WAITING_REQUESTER',
    resume: (supplier || staff) && s === 'WAITING_THIRD_PARTY',
    attachLaudo: (supplier || staff) && s === 'WAITING_THIRD_PARTY',
    escalate: staff && active && (sla.state === 'atencao' || sla.state === 'violado'),
  };
}
