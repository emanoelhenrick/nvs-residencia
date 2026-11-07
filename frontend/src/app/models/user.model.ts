import { Role } from './role.model';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId: string | null;
  city?: string | null;
  supplier?: string | null;
  device: string | null;
  active: boolean;
}

export interface JwtPayload extends IUser {
  exp: number;
}

export interface INewUser {
  name: string;
  email: string;
  role: Role;
  unitId?: string;
  supplier?: string;
}

export interface IUserAccessChange {
  role: Role;
  active: boolean;
  justification: string;
}

export interface IUserQuery {
  role?: Role;
  active?: boolean;
  assignable?: boolean;
}
