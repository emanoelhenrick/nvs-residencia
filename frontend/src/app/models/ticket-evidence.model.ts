import { EvidenceKind } from './ticket-enums.model';

export interface IEvidence {
  id: string;
  name: string;
  sizeKb: number;
  by: string;
  at: string;
  note: string;
  kind: EvidenceKind;
}
