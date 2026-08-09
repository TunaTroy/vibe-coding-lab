  function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`${name} is required`);
  }
  return value;
}

const databaseUrl = getRequiredEnv('DATABASE_URL');
const jwtSecret = getRequiredEnv('JWT_SECRET');
const googleClientId = getRequiredEnv('GOOGLE_CLIENT_ID');

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: databaseUrl,
  JWT_SECRET: jwtSecret,
  GOOGLE_CLIENT_ID: googleClientId,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};
