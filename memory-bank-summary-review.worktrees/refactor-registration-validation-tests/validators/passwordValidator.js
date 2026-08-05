function buildInvalidPasswordResult(message) {
  return {
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
    message,
  };
}

function checkPasswordStrength(password) {
  if (typeof password !== 'string') {
    return buildInvalidPasswordResult('Password must be a string.');
  }

  const normalizedPassword = password.trim();

  if (normalizedPassword.length === 0) {
    return buildInvalidPasswordResult('Password cannot be empty.');
  }

  const checks = {
    length: normalizedPassword.length >= 8,
    hasLowercase: /[a-z]/.test(normalizedPassword),
    hasUppercase: /[A-Z]/.test(normalizedPassword),
    hasNumber: /\d/.test(normalizedPassword),
    hasSymbol: /[^A-Za-z0-9]/.test(normalizedPassword),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label = 'weak';
  let message = 'Password is weak. Add more variety.';
  let isStrong = false;

  if (normalizedPassword.length >= 8 && score >= 4) {
    label = 'strong';
    message = 'Password is strong.';
    isStrong = true;
  } else if (normalizedPassword.length >= 8 && score >= 2) {
    label = 'medium';
    message = 'Password is acceptable but can be improved.';
  }

  return {
    score,
    label,
    isStrong,
    checks,
    message,
  };
}

module.exports = {
  checkPasswordStrength,
};
