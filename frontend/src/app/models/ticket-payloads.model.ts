import { IPickedFile } from './picked-file.model';
import { Severity, TicketScope, WaitKind } from './ticket-enums.model';

export interface INewTicket {
  category: string;
  title: string;
  description: string;
  impact: string;
  affectsOthers: boolean;
  errorCode: string;
  unitId?: string;
  evidence: IPickedFile | null;
}

export interface ITriagePayload {
  severity: Severity;
  urgency: string;
  scope: TicketScope;
  assigneeId: string;
  justification: string;
}

export interface ITextPayload {
  text: string;
}

export interface ICommentPayload extends ITextPayload {
  evidence?: IPickedFile | null;
}

export interface IEvidencePayload extends IPickedFile {
  kind: 'laudo' | 'complementar';
}

export interface IWaitPayload {
  kind: WaitKind;
  reason: string;
  supplierId?: string;
}

export interface ILinkIncidentPayload {
  childIds: string[];
  parentId: string;
  justification: string;
}

export interface IDiscardIncidentPayload {
  childIds: string[];
  justification: string;
}

export interface ILinkIncidentResponse {
  parentId: string;
}
