export interface ITeam {
  id: string;
  name: string;
  teamLevel: 'N1' | 'N2' | 'N3' | 'INFRA' | 'ECOMMERCE' | 'SUPPLIER';
}
