import { Priority, SlaState, SlaTone } from './ticket-enums.model';

export interface ISlaView {
  state: SlaState;
  priority: Priority | null;
  tmrMin: number;
  tmsMin: number;
  consumedMin: number;
  remainingMin: number;
  overMin: number;
  pct: number;
  label: string;
  listLabel: string;
  tone: SlaTone;
}
