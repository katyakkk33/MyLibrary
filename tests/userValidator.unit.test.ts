import { validatePasswordPolicy } from '../src/utils/userValidator';

describe('validatePasswordPolicy', () => {
  it('odrzuca zbyt krótkie hasło', () => {
    const err = validatePasswordPolicy('abc');
    expect(err).toBeTruthy();
  });

  it('odrzuca hasło bez cyfr', () => {
    const err = validatePasswordPolicy('abcdefg');
    expect(err).toBeTruthy();
  });

  it('odrzuca hasło bez liter', () => {
    const err = validatePasswordPolicy('1234567');
    expect(err).toBeTruthy();
  });

  it('akceptuje prawidłowe hasło', () => {
    const err = validatePasswordPolicy('Abcd1234');
    expect(err).toBeNull();
  });
});
