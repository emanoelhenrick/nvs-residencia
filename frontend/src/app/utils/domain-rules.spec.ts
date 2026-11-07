import { ITicket, IUser } from '../models';
import { capsFor } from './caps';
import { suggestGroups } from './incident-groups';
import { slaView } from './sla';

const NOW = new Date('2026-11-04T12:00:00').getTime();
const at = (minAgo: number) => {
  const d = new Date(NOW - minAgo * 60000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};

function makeTicket(over: Partial<ITicket> = {}): ITicket {
  return {
    id: 'NX-1', kind: 'chamado', title: 't', description: 'd', category: 'PDV', errorCode: 'E1', impact: 'i',
    affectsOthers: false, scope: 'este', status: 'IN_PROGRESS', severity: 'S2', priority: 'P2', urgency: 'u',
    requester: { id: 'U1', name: 'Ana' }, unitId: 'Loja 042', device: 'PDV-07', assignee: 'Marina', assigneeId: 'M1',
    supplier: null, openedAt: at(60), evidences: [], comments: [], history: [],
    sla: { consumedMin: 0, runningSince: at(60), pausedSince: null, pauseReason: null, firstResponse: null, concludedAt: null, attentionAt: null, violatedAt: null },
    parentId: null, childIds: [], group: null, groupDismissed: null, resolution: null, cancellation: null,
    reopening: null, closedAuto: null, reassessments: [], escalations: [], ...over,
  };
}
const user = (role: IUser['role']): IUser => ({ id: 'X', name: 'X', email: 'x@x.com', role, unitId: null, device: null, active: true });

describe('slaView', () => {
  it('sem prioridade → sem SLA', () => {
    expect(slaView(makeTicket({ priority: null }), NOW).state).toBe('sem-sla');
  });

  it('P2 (TMS 360min) com 60min consumidos → dentro do prazo', () => {
    const v = slaView(makeTicket(), NOW);
    expect(v.state).toBe('dentro-prazo');
    expect(v.consumedMin).toBe(60);
    expect(v.remainingMin).toBe(300);
  });

  it('≥ 80% → atenção; ≥ 100% → violado', () => {
    expect(slaView(makeTicket({ sla: { ...makeTicket().sla, runningSince: at(300) } }), NOW).state).toBe('atencao');
    expect(slaView(makeTicket({ sla: { ...makeTicket().sla, runningSince: at(400) } }), NOW).state).toBe('violado');
  });

  it('pausado congela o consumido', () => {
    const t = makeTicket({
      status: 'WAITING_REQUESTER',
      sla: { ...makeTicket().sla, consumedMin: 100, runningSince: null, pausedSince: at(30), pauseReason: 'foto' },
    });
    const v = slaView(t, NOW);
    expect(v.state).toBe('pausado');
    expect(v.consumedMin).toBe(100);
  });

  it('resolvido → concluído; reaberto → preservado', () => {
    expect(slaView(makeTicket({ status: 'RESOLVED' }), NOW).state).toBe('concluido');
    expect(slaView(makeTicket({ status: 'REOPENED' }), NOW).state).toBe('preservado');
  });
});

describe('capsFor', () => {
  const t = makeTicket();
  const sla = slaView(t, NOW);

  it('solicitante comenta e pede reavaliação, mas não resolve nem cancela', () => {
    const c = capsFor(t, user('REQUESTER'), sla);
    expect(c.comment && c.reassess).toBeTrue();
    expect(c.resolve || c.cancel || c.wait).toBeFalse();
  });

  it('especialista resolve, cancela e registra espera', () => {
    const c = capsFor(t, user('SPECIALIST'), sla);
    expect(c.resolve && c.cancel && c.wait).toBeTrue();
  });

  it('fornecedor resolve mas não cancela nem registra espera', () => {
    const c = capsFor(t, user('SUPPLIER'), sla);
    expect(c.resolve).toBeTrue();
    expect(c.cancel || c.wait).toBeFalse();
  });

  it('solicitante reabre chamado resolvido', () => {
    const resolved = makeTicket({ status: 'RESOLVED' });
    expect(capsFor(resolved, user('REQUESTER'), slaView(resolved, NOW)).reopen).toBeTrue();
  });

  it('incidente pai não tem ações', () => {
    const parent = makeTicket({ kind: 'incidente-pai' });
    expect(Object.values(capsFor(parent, user('LEADER'), slaView(parent, NOW))).some(Boolean)).toBeFalse();
  });
});

describe('suggestGroups', () => {
  it('agrupa mesma categoria e unidade dentro de 15 minutos', () => {
    const list = [
      makeTicket({ id: 'A', openedAt: at(30) }),
      makeTicket({ id: 'B', openedAt: at(25) }),
      makeTicket({ id: 'C', openedAt: at(20) }),
    ];
    const groups = suggestGroups(list);
    expect(groups.length).toBe(1);
    expect(groups[0].tickets.map((x) => x.id)).toEqual(['A', 'B', 'C']);
  });

  it('não agrupa unidades ou categorias diferentes, nem fora da janela', () => {
    const list = [
      makeTicket({ id: 'A', openedAt: at(60) }),
      makeTicket({ id: 'B', openedAt: at(10), unitId: 'Loja 015' }),
      makeTicket({ id: 'C', openedAt: at(9), category: 'Rede' }),
      makeTicket({ id: 'D', openedAt: at(8) }),
    ];
    expect(suggestGroups(list).length).toBe(0);
  });

  it('ignora chamados já vinculados ou com sugestão descartada', () => {
    const list = [
      makeTicket({ id: 'A', openedAt: at(30), parentId: 'P' }),
      makeTicket({ id: 'B', openedAt: at(25), groupDismissed: { text: 'x', by: 'y', at: at(1) } }),
      makeTicket({ id: 'C', openedAt: at(20) }),
    ];
    expect(suggestGroups(list).length).toBe(0);
  });
});
