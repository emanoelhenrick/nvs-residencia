export interface IFilters {
  search: string;
  unitId: string;
  status: string;
  priority: string;
  assignee: string;
  category: string;
  from: string;
  to: string;
}

/** Consulta aceita pela API: filtros da lista + critérios internos. */
export interface ITicketQuery extends Partial<IFilters> {
  kind?: string;
  parentId?: string;
}
