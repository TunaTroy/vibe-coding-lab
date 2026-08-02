const { validateRegistrationForm } = require('./registrationValidator');

function buildValidFormData(overrides = {}) {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'Abc12345!@#',
    age: 35,
    ...overrides,
  };
}

describe('validateRegistrationForm', () => {
  test('returns a fallback error result for non-object input', () => {
    const result = validateRegistrationForm(null);

    expect(result).toEqual({
      isValid: false,
      message: 'Please fix the registration errors.',
      errors: {
        name: 'Registration data must be provided as an object.',
      },
      data: {
        name: '',
        email: '',
        password: '',
        age: null,
      },
    });
  });

  test('returns a success result for a fully valid registration payload', () => {
    const result = validateRegistrationForm(buildValidFormData());

    expect(result).toEqual({
      isValid: true,
      message: 'Registration successful. Welcome!',
      errors: {},
      data: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Abc12345!@#',
        age: 35,
      },
    });
  });

  test('reports an invalid name when the field is not a string', () => {
    const result = validateRegistrationForm(buildValidFormData({ name: 123 }));

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name is required.');
  });

  test('reports an invalid name when the field is empty after trimming', () => {
    const result = validateRegistrationForm(buildValidFormData({ name: '   ' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name cannot be empty.');
  });

  test('reports an invalid email when the field is empty after trimming', () => {
    const result = validateRegistrationForm(buildValidFormData({ email: '   ' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Email cannot be empty.');
  });

  test('reports an invalid email when the field is not a string', () => {
    const result = validateRegistrationForm(buildValidFormData({ email: 123 }));

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Email is required.');
  });

  test('reports an invalid email when the format is invalid', () => {
    const result = validateRegistrationForm(buildValidFormData({ email: 'invalid-email' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Email format is invalid.');
  });

  test('reports an invalid password when the field is not a string', () => {
    const result = validateRegistrationForm(buildValidFormData({ password: { value: 'abc' } }));

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe('Password is required.');
  });

  test('reports an invalid password when it is too short', () => {
    const result = validateRegistrationForm(buildValidFormData({ password: 'abc' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe('Password must be at least 8 characters long.');
  });

  test('reports an invalid password when it lacks variety', () => {
    const result = validateRegistrationForm(buildValidFormData({ password: 'Abcdefgh' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe('Password must include lowercase, uppercase, number, and symbol.');
  });

  test('reports an invalid password when the field is empty after trimming', () => {
    const result = validateRegistrationForm(buildValidFormData({ password: '   ' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe('Password cannot be empty.');
  });

  test('reports an invalid age when the field is missing', () => {
    const result = validateRegistrationForm(buildValidFormData({ age: '' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.age).toBe('Age is required.');
  });

  test('reports an invalid age when the field is not a valid number', () => {
    const result = validateRegistrationForm(buildValidFormData({ age: 'not-a-number' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.age).toBe('Age must be a valid number.');
  });

  test('reports an invalid age when the field is whitespace-only string', () => {
    const result = validateRegistrationForm(buildValidFormData({ age: '   ' }));

    expect(result.isValid).toBe(false);
    expect(result.errors.age).toBe('Age must be a valid number.');
  });

  test('reports an invalid age when the field is not an integer', () => {
    const result = validateRegistrationForm(buildValidFormData({ age: 18.5 }));

    expect(result.isValid).toBe(false);
    expect(result.errors.age).toBe('Age must be an integer.');
  });

  test('reports an invalid age when the field is below 18', () => {
    const result = validateRegistrationForm(buildValidFormData({ age: 17 }));

    expect(result.isValid).toBe(false);
    expect(result.errors.age).toBe('You must be at least 18 years old.');
  });

  test('reports an invalid age when the field is an object', () => {
    const result = validateRegistrationForm(buildValidFormData({ age: {} }));

    expect(result.isValid).toBe(false);
    expect(result.errors.age).toBe('Age must be a valid number.');
  });
});
