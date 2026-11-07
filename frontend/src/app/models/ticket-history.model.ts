import { HistoryKind } from './ticket-enums.model';

export interface IHistory {
  id: string;
  at: string;
  author: string;
  from: string | null;
  to: string;
  text: string;
  kind: HistoryKind;
}
