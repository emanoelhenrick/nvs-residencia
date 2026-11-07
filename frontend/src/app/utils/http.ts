/** Mensagem amigável a partir de um erro HTTP da API (`{ message }`). */
export function errorMessage(err: unknown, fallback: string): string {
  const message = (err as { error?: { message?: unknown } } | null)?.error?.message;
  return typeof message === 'string' && message ? message : fallback;
}
