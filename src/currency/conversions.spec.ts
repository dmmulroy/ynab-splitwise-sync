import {
  centsToDollars,
  centsToMiliunits,
  dollarsToCents,
  dollarsToMiliunits,
  miliunitsToCents,
} from './conversions';

describe('Currency Conversions', () => {
  test('centsToDollars should convert 12393 to 123.93', () => {
    expect(centsToDollars(12393)).toEqual(123.93);
  });

  test('centsToMiliunits shoulver convert 12393 to 12390', () => {
    expect(centsToMiliunits(12393)).toEqual(123930);
  });

  test('dollarsToCents should convert 123.93 to 12393', () => {
    expect(dollarsToCents(123.93)).toEqual(12393);
  });

  test('miliunitsToCents should convert 123930 to 12393', () => {
    expect(miliunitsToCents(123930)).toEqual(12393);
  });

  test('dollarsToMiliunits should convert 123.93 to 123930', () => {
    expect(dollarsToMiliunits(123.93)).toEqual(123930);
  });
});
