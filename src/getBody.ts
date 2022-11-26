export function getBody(): string {
  return process.env.YNAB_PAYEE_NAME ?? 'test';
}
