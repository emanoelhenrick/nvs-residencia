import { Role } from '../models';

export const ROLE_LABEL: Record<Role, string> = {
  REQUESTER: 'Loja/CD',
  TRIAGE_AGENT: 'Agente de Triagem (N1)',
  SPECIALIST: 'Especialista',
  SUPPLIER: 'Fornecedor',
  LEADER: 'Líder / Gestor',
};

export const ROLE_SCOPE: Record<Role, string> = {
  REQUESTER: 'Unidade autorizada',
  TRIAGE_AGENT: 'Fila autorizada',
  SPECIALIST: 'Fila de especialidade',
  SUPPLIER: 'Somente chamados atribuídos',
  LEADER: 'Visão global e administração',
};

export const ROLE_DESC: Record<Role, string> = {
  REQUESTER: 'Abrir e acompanhar chamados do escopo autorizado da unidade.',
  TRIAGE_AGENT: 'Triagem, classificação e atendimento inicial na fila autorizada.',
  SPECIALIST: 'Atendimento de demandas complexas e especializadas.',
  SUPPLIER: 'Atender apenas chamados atribuídos. Sem consulta global.',
  LEADER: 'Gerenciar usuários, equipes, permissões e configurações globais.',
};

export const ROLES = Object.keys(ROLE_LABEL) as Role[];
