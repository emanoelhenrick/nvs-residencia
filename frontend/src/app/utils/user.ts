import { ROLE_LABEL, ROLE_SCOPE } from '../constants/role.constants';
import { IUser } from '../models';

export function userLabel(u: IUser): string {
  switch (u.role) {
    case 'REQUESTER':
      return `${u.name} · ${u.id}`;
    case 'SUPPLIER':
      return `${u.name} · ${u.supplier ?? ROLE_LABEL.SUPPLIER}`;
    default:
      return `${u.name} · ${ROLE_LABEL[u.role] ?? u.role}`;
  }
}

/** Escopo de consulta exibido na administração. */
export function scopeOf(u: IUser): string {
  switch (u.role) {
    case 'REQUESTER':
      return u.unitId ?? 'Sem unidade';
    case 'SUPPLIER':
      return `${u.supplier ?? 'Fornecedor'} · atribuídos`;
    default:
      return ROLE_SCOPE[u.role];
  }
}
