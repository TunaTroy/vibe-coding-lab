const { checkPasswordStrength } = require('./passwordValidator');

describe('checkPasswordStrength', () => {
  test('returns weak for non-string input', () => {
    expect(checkPasswordStrength(null)).toEqual({
      score: 0,
      label: 'weak',
      isStrong: false,
      checks: {
        length: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
      },
      message: 'Password must be a string.',
    });
  });

  test('returns weak for empty or whitespace-only passwords', () => {
    expect(checkPasswordStrength('   ')).toEqual({
      score: 0,
      label: 'weak',
      isStrong: false,
      checks: {
        length: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
      },
      message: 'Password cannot be empty.',
    });
  });

  test('returns weak for short passwords with insufficient variety', () => {
    expect(checkPasswordStrength('abc')).toMatchObject({
      score: 1,
      label: 'weak',
      isStrong: false,
      message: 'Password is weak. Add more variety.',
    });
  });

  test('returns medium for passwords with at least 8 characters and 2 categories', () => {
    expect(checkPasswordStrength('Abcdefgh')).toMatchObject({
      score: 3,
      label: 'medium',
      isStrong: false,
      checks: {
        length: true,
        hasLowercase: true,
        hasUppercase: true,
        hasNumber: false,
        hasSymbol: false,
      },
      message: 'Password is acceptable but can be improved.',
    });
  });

  test('returns strong for long passwords with enough variety', () => {
    expect(checkPasswordStrength('Abc12345!@#')).toMatchObject({
      score: 5,
      label: 'strong',
      isStrong: true,
      checks: {
        length: true,
        hasLowercase: true,
        hasUppercase: true,
        hasNumber: true,
        hasSymbol: true,
      },
      message: 'Password is strong.',
    });
  });
});
