const { isValidEmail } = require('./emailValidator');
const { checkPasswordStrength } = require('./passwordValidator');

function validateRegistrationForm(formData) {
  function buildErrorResult(errors, fallbackData) {
    return {
      isValid: false,
      message: 'Please fix the registration errors.',
      errors,
      data: fallbackData,
    };
  }

  if (formData === null || formData === undefined || typeof formData !== 'object' || Array.isArray(formData)) {
    return buildErrorResult(
      {
        name: 'Registration data must be provided as an object.',
      },
      {
        name: '',
        email: '',
        password: '',
        age: null,
      },
    );
  }

  const errors = {};
  let name = '';
  let email = '';
  let password = '';
  let age = null;

  const rawName = formData.name;
  if (typeof rawName !== 'string') {
    errors.name = 'Name is required.';
  } else {
    const trimmedName = rawName.trim();
    if (trimmedName.length === 0) {
      errors.name = 'Name cannot be empty.';
    } else {
      name = trimmedName;
    }
  }

  const rawEmail = formData.email;
  if (typeof rawEmail !== 'string') {
    errors.email = 'Email is required.';
  } else {
    const trimmedEmail = rawEmail.trim();
    if (trimmedEmail.length === 0) {
      errors.email = 'Email cannot be empty.';
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = 'Email format is invalid.';
    } else {
      email = trimmedEmail;
    }
  }

  const rawPassword = formData.password;
  if (typeof rawPassword !== 'string') {
    errors.password = 'Password is required.';
  } else {
    const trimmedPassword = rawPassword.trim();
    if (trimmedPassword.length === 0) {
      errors.password = 'Password cannot be empty.';
    } else {
      const passwordStrength = checkPasswordStrength(trimmedPassword);
      if (!passwordStrength.isStrong) {
        if (!passwordStrength.checks.length) {
          errors.password = 'Password must be at least 8 characters long.';
        } else {
          errors.password = 'Password must include lowercase, uppercase, number, and symbol.';
        }
      } else {
        password = trimmedPassword;
      }
    }
  }

  const rawAge = formData.age;
  if (rawAge === undefined || rawAge === null || rawAge === '') {
    errors.age = 'Age is required.';
  } else {
    let parsedAge = null;

    if (typeof rawAge === 'number') {
      parsedAge = rawAge;
    } else if (typeof rawAge === 'string') {
      const trimmedAge = rawAge.trim();
      if (trimmedAge.length === 0) {
        parsedAge = null;
      } else {
        parsedAge = Number(trimmedAge);
      }
    } else {
      parsedAge = null;
    }

    if (parsedAge === null || Number.isNaN(parsedAge) || !Number.isFinite(parsedAge)) {
      errors.age = 'Age must be a valid number.';
    } else if (!Number.isInteger(parsedAge)) {
      errors.age = 'Age must be an integer.';
    } else if (parsedAge < 18) {
      errors.age = 'You must be at least 18 years old.';
    } else {
      age = parsedAge;
    }
  }

  if (Object.keys(errors).length > 0) {
    return buildErrorResult(errors, {
      name,
      email,
      password,
      age,
    });
  }

  return {
    isValid: true,
    message: 'Registration successful. Welcome!',
    errors: {},
    data: {
      name,
      email,
      password,
      age,
    },
  };
}

module.exports = {
  validateRegistrationForm,
};
