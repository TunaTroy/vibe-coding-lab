const { isValidEmail } = require('./emailValidator');

describe('isValidEmail', () => {
  test('accepts a standard email address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  test('accepts quoted local-parts and subdomains', () => {
    expect(isValidEmail('"john.doe"@sub.domain.example.com')).toBe(true);
  });

  test('rejects missing @ sign', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  test('rejects invalid domain labels', () => {
    expect(isValidEmail('user@-example.com')).toBe(false);
  });

  test('rejects invalid characters in local part', () => {
    expect(isValidEmail('user<>@example.com')).toBe(false);
  });
});
