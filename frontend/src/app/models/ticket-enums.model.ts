export type TicketStatus =
  | 'OPEN'
  | 'IN_TRIAGE'
  | 'IN_PROGRESS'
  | 'WAITING_REQUESTER'
  | 'WAITING_THIRD_PARTY'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REOPENED';

export type Severity = 'S1' | 'S2' | 'S3' | 'S4';
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type TicketKind = 'chamado' | 'incidente-pai';
export type TicketScope = 'este' | 'outros';
export type EvidenceKind = 'inicial' | 'complementar' | 'laudo' | 'relato';
export type WaitKind = 'requester' | 'third-party';

export type SlaState =
  | 'sem-sla'
  | 'dentro-prazo'
  | 'atencao'
  | 'violado'
  | 'pausado'
  | 'concluido'
  | 'preservado';

export type SlaTone = 'ok' | 'warn' | 'danger' | 'paused' | 'done' | 'none';

export type HistoryKind =
  | 'open'
  | 'triage'
  | 'assign'
  | 'pause'
  | 'resume'
  | 'resolve'
  | 'cancel'
  | 'reopen'
  | 'close'
  | 'sla'
  | 'escalation'
  | 'link'
  | 'reassessment'
  | 'continue';
