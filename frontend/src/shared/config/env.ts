export const isDockerEnvironment = (env: Record<string, string | undefined>): boolean => {
  return (
    env.DOCKER_COMPOSE === 'true' ||
    env.COMPOSE_PROJECT_NAME !== undefined ||
    env.HOSTNAME?.includes('docker') ||
    env.CONTAINER === 'true' ||
    env.VITE_DOCKER_COMPOSE === 'true' ||
    env.VITE_COMPOSE_PROJECT_NAME !== undefined ||
    env.VITE_HOSTNAME?.includes('docker') ||
    env.VITE_CONTAINER === 'true'
  );
};

export const getApiUrl = (env: Record<string, string | undefined>): string => {
  if (isDockerEnvironment(env)) {
    return env.VITE_DOCKER_API_URL || 'http://backend:3001';
  }

  return env.VITE_API_URL || 'http://localhost:3001';
};
