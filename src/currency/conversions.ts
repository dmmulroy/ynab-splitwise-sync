export function centsToDollars(amount: number): number {
  return round(amount / 100);
}

export function centsToMiliunits(amount: number): number {
  return round(amount * 10);
}

export function dollarsToCents(amount: number): number {
  return round(amount * 100);
}

export function miliunitsToCents(amount: number): number {
  return round(amount / 10);
}

export function dollarsToMiliunits(amount: number): number {
  return round(amount * 1000);
}

function round(number: number): number {
  return Math.round((number + Number.EPSILON) * 100) / 100;
}
