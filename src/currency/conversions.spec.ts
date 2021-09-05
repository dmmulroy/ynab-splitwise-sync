import {
  centsToDollars,
  centsToMiliunits,
  dollarsToCents,
  miliunitsToCents,
} from './conversions';

describe('Currency Conversions', () => {
  test('centsToDollars should convert 12393 to 123.93', () => {
    expect(centsToDollars(12393)).toEqual(123.93);
  });

  test('centsToMiliunits shoulver convert 12393 to 12390', () => {
    expect(centsToMiliunits(12393)).toEqual(123930);
  });

  test('dollarsToCents shoulver convert 123.93 to 12393', () => {
    expect(dollarsToCents(123.93)).toEqual(12393);
  });

  test('miliunitsToCents shoulver convert 123930 to 12393', () => {
    expect(miliunitsToCents(123930)).toEqual(12393);
  });
});
