function readEnvValue(key: string, fallbackValue: string) {
  const configuredValue = process.env[key];
  if (configuredValue && configuredValue.trim().length > 0) {
    return configuredValue;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${key} is required in production`);
  }
  return fallbackValue;
}

export function getJwtAccessSecret() {
  return readEnvValue('JWT_ACCESS_SECRET', 'devAccessSecret');
}

export function getJwtRefreshSecret() {
  return readEnvValue('JWT_REFRESH_SECRET', 'devRefreshSecret');
}
