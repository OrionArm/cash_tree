import { getApiUrl } from './env';

const isDev = import.meta.env.NODE_ENV === 'development' || import.meta.env.NODE_ENV === 'dev';
const API_BASE_URL = getApiUrl(import.meta.env);

export const API_CONFIG = {
  BASE_URL: isDev ? '' : API_BASE_URL,
  ENDPOINTS: {
    tree: isDev ? '/api/v1/tree' : `${API_BASE_URL}/api/v1/tree`,
    cacheLoad: isDev ? '/api/v1/cache/load' : `${API_BASE_URL}/api/v1/cache/load`,
    cacheTree: isDev ? '/api/v1/cache/tree' : `${API_BASE_URL}/api/v1/cache/tree`,
    cacheOperations: isDev ? '/api/v1/cache/operations' : `${API_BASE_URL}/api/v1/cache/operations`,
    cacheCreate: isDev ? '/api/v1/cache/create' : `${API_BASE_URL}/api/v1/cache/create`,
    cacheUpdate: isDev ? '/api/v1/cache/update' : `${API_BASE_URL}/api/v1/cache/update`,
    cacheDelete: isDev ? '/api/v1/cache/delete' : `${API_BASE_URL}/api/v1/cache/delete`,
    cacheApply: isDev ? '/api/v1/cache/apply' : `${API_BASE_URL}/api/v1/cache/apply`,
    cacheReset: isDev ? '/api/v1/cache/reset' : `${API_BASE_URL}/api/v1/cache/reset`,
  },
} as const;
