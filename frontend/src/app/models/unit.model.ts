export type UnitType = 'Loja' | 'Centro de distribuição';

export interface IUnit {
  id: string;
  type: UnitType;
  city: string;
  uf: string;
  manager: string;
}

export type INewUnit = IUnit;
export type IUnitChange = Omit<IUnit, 'id'>;
