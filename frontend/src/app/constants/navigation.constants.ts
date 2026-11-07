import { Role } from '../models';

export interface INavItem {
  label: string;
  icon: string;
  path: string;
  roles: Role[];
}

const ALL: Role[] = ['REQUESTER', 'TRIAGE_AGENT', 'SPECIALIST', 'SUPPLIER', 'LEADER'];


export const NAV_ITEMS: INavItem[] = [
  { label: 'Dashboard', icon: 'clock', path: '/dashboard', roles: ALL },
  { label: 'Lista de chamados', icon: 'inbox', path: '/list-tickets', roles: ALL },
  {
    label: 'Abrir chamado',
    icon: 'plus',
    path: '/new-ticket',
    roles: ['REQUESTER', 'TRIAGE_AGENT', 'SPECIALIST', 'LEADER'],
  },
  { label: 'Triagem', icon: 'alert', path: '/triage', roles: ['TRIAGE_AGENT', 'LEADER'] },
  {
    label: 'Atendimento',
    icon: 'clock',
    path: '/attendance',
    roles: ['TRIAGE_AGENT', 'SPECIALIST', 'SUPPLIER', 'LEADER'],
  },
  { label: 'Administração', icon: 'info', path: '/admin', roles: ['LEADER'] },
];

export const rolesFor = (path: string): Role[] =>
  NAV_ITEMS.find((i) => i.path === path)?.roles ?? [];

export const screensFor = (role: Role): string =>
  NAV_ITEMS.filter((i) => i.roles.includes(role))
    .map((i) => i.label)
    .join(', ');
