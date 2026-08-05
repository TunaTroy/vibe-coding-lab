const { isValidEmail, isDisposableEmail, normalizeEmail } = require('./emailValidator');

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

  test('returns false for non-string input', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
    expect(isValidEmail({})).toBe(false);
  });
});

describe('isDisposableEmail', () => {
  test('returns true for a known disposable email domain', () => {
    expect(isDisposableEmail('temp@10minutemail.com')).toBe(true);
  });

  test('returns true for a disposable email domain with uppercase letters', () => {
    expect(isDisposableEmail('temp@MAILINATOR.COM')).toBe(true);
  });

  test('returns false for a normal email domain', () => {
    expect(isDisposableEmail('user@example.com')).toBe(false);
  });

  test('returns false for non-string input', () => {
    expect(isDisposableEmail(null)).toBe(false);
    expect(isDisposableEmail(123)).toBe(false);
    expect(isDisposableEmail({})).toBe(false);
  });

  test('returns false for string input without @', () => {
    expect(isDisposableEmail('notanemail')).toBe(false);
  });
});

describe('normalizeEmail', () => {
  test('trims whitespace and lowercases the email', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });

  test('returns an empty string for non-string input', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(123)).toBe('');
  });
});
