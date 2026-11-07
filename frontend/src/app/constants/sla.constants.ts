import { Priority } from '../models';

export interface ISlaParam {
  tmr: number;
  tms: number;
  coverage: string;
}

export const SLA_PARAMS: Record<Priority, ISlaParam> = {
  P1: { tmr: 15, tms: 120, coverage: '24/7' },
  P2: { tmr: 30, tms: 360, coverage: 'Horário Loja–CD' },
  P3: { tmr: 120, tms: 1440, coverage: 'Comercial · Seg–Sáb' },
  P4: { tmr: 240, tms: 4320, coverage: 'Administrativo · Seg–Sex' },
};

export const PRIORITIES = Object.keys(SLA_PARAMS) as Priority[];
export const ATTENTION_PCT = 80;
export const GROUP_WINDOW_MIN = 15;
