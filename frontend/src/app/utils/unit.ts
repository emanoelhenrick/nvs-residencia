import { IUnit } from '../models';

/** "Loja 042 · Recife" — cai para o próprio id quando a unidade não é encontrada. */
export function unitLabel(units: IUnit[], id: string | null | undefined): string {
  if (!id) return '—';
  const u = units.find((x) => x.id === id);
  return u ? `${u.id} · ${u.city}` : id;
}
