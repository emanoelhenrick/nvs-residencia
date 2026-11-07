import { Role } from '../models';

/** Perfis internos que atendem chamados (N1, especialista e líder). */
export const STAFF_ROLES: Role[] = ['TRIAGE_AGENT', 'SPECIALIST', 'LEADER'];

export const isStaff = (role?: Role | '' | null): boolean =>
  !!role && STAFF_ROLES.includes(role as Role);
