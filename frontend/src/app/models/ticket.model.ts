import { IAction, IGroupDecision } from './ticket-action.model';
import { IComment } from './ticket-comment.model';
import { Priority, Severity, TicketKind, TicketScope, TicketStatus } from './ticket-enums.model';
import { IEvidence } from './ticket-evidence.model';
import { IHistory } from './ticket-history.model';
import { ISla } from './ticket-sla.model';
import { ISupplier } from './ticket-supplier.model';

export interface IRequester {
  id: string | null;
  name: string;
}

export interface ITicket {
  id: string;
  kind: TicketKind;
  title: string;
  description: string;
  category: string;
  errorCode: string;
  impact: string;
  affectsOthers: boolean;
  scope: TicketScope;
  status: TicketStatus;
  severity: Severity | null;
  priority: Priority | null;
  urgency: string;
  requester: IRequester;
  unitId: string;
  device: string;
  assignee: string;
  assigneeId: string | null;
  supplier: ISupplier | null;
  openedAt: string;
  evidences: IEvidence[];
  comments: IComment[];
  history: IHistory[];
  sla: ISla;
  parentId: string | null;
  childIds: string[];
  group: IGroupDecision | null;
  groupDismissed: IAction | null;
  resolution: IAction | null;
  cancellation: IAction | null;
  reopening: IAction | null;
  closedAuto: string | null;
  reassessments: IAction[];
  escalations: IAction[];
}
