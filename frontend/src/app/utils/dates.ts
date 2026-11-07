const p = (n: number) => String(n).padStart(2, '0');

export const toIso = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const toMs = (iso: string) => new Date(iso).getTime();

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const fmtDateTime = (iso: string) => `${fmtDate(iso)} às ${fmtTime(iso)}`;

export const fmtStamp = (iso: string) => `${fmtDate(iso)} · ${fmtTime(iso)}`;

export const dateInput = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const fmtInputDate = (v: string) => {
  const [y, m, d] = v.split('-');
  return `${d}/${m}/${y}`;
};

export const minutesBetween = (aMs: number, bMs: number) =>
  Math.max(0, Math.floor((bMs - aMs) / 60000));

export function fmtDur(min: number, pad = false): string {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60),
    r = m % 60;
  const hs = pad ? p(h) : String(h);
  return r ? `${hs}h${p(r)}min` : `${hs}h`;
}
