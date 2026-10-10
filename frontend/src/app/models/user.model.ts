import { ILocation } from './location.model';
import { ITeam } from './team.model';

export interface IUser {
  id: string;
  name: string;
  email: string;
  userRole: 'REQUESTER' | 'TRIAGE_AGENT' | 'SPECIALIST' | 'SUPPLIER' | 'LEADER';
  location: ILocation;
  team: ITeam;
}
