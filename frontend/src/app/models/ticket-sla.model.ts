export interface IFirstResponse {
  by: string;
  at: string;
  text: string;
}

export interface ISla {
  consumedMin: number;
  runningSince: string | null;
  pausedSince: string | null;
  pauseReason: string | null;
  firstResponse: IFirstResponse | null;
  concludedAt: string | null;
  attentionAt: string | null;
  violatedAt: string | null;
}
