/** Registro auditável simples: texto, autor e data. */
export interface IAction {
  text: string;
  by: string;
  at: string;
}

/** Decisão humana de agrupamento em um Incidente Pai. */
export interface IGroupDecision extends IAction {
  criterion: string;
  evidenceNote: string;
}
