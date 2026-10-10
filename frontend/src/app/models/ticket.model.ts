import { IDevice } from './device.model';
import { ILocation } from './location.model';
import { ITeam } from './team.model';
import { IUser } from './user.model';

export interface ITicket {
  description: string;
  category: string;
  requester: IUser;
  location: ILocation;
  device: IDevice;
  status:
    | 'OPEN'
    | 'IN_TRIAGE'
    | 'IN_PROGRESS'
    | 'WAITING_REQUESTER'
    | 'WAITING_THIRD_PARTY'
    | 'RESOLVED'
    | 'CLOSED'
    | 'CANCELLED'
    | 'REOPENED';
  assignedTeam: ITeam;
}

export interface ITicketResponse {
  protocol: string;
  summary: string;
  category: string;
  assignee: string;
  unit: string;
  status: string;
  statusType: 'service' | 'triage' | 'open' | 'warning' | 'resolved' | 'closed';
  priority: string;
  tmsSituation: string;
  tmsSolutionText: string;
  tmsSolutionProgress?: number;
  selected?: boolean;
}

export interface IFileEvidence {
  name: string;
  size: string;
  description: string;
}

export interface IFilterTicket {
  search: string;
  unit: string;
  status: string;
  priority: string;
  assignee: string;
  category: string;
  period: string;
}
