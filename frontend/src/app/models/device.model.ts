import { ILocation } from './location.model';

export interface IDevice {
  location: ILocation;
  deviceType: 'POS' | 'TABLET' | 'SCANNER' | 'LABEL_PRINTER' | 'DESKTOP';
  identifier: string;
}
