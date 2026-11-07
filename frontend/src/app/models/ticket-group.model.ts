import { ITicket } from './ticket.model';

/** Sugestão de possível incidente: mesma categoria e unidade em janela curta. */
export interface IGroup {
  key: string;
  category: string;
  unitId: string;
  tickets: ITicket[];
  spanMin: number;
}
