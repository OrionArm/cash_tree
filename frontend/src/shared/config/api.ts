import { getApiUrl } from './env';

const isDev = import.meta.env.NODE_ENV === 'development' || import.meta.env.NODE_ENV === 'dev';
const API_BASE_URL = getApiUrl(import.meta.env);

const endpoint = (path: string): string => (isDev ? path : `${API_BASE_URL}${path}`);

export const API_CONFIG = {
  BASE_URL: isDev ? '' : API_BASE_URL,
  ENDPOINTS: {
    tree: endpoint('/api/v1/tree'),
    cacheLoad: endpoint('/api/v1/cache/load'),
    cacheTree: endpoint('/api/v1/cache/tree'),
    cacheOperations: endpoint('/api/v1/cache/operations'),
    cacheCreate: endpoint('/api/v1/cache/create'),
    cacheUpdate: endpoint('/api/v1/cache/update'),
    cacheDelete: endpoint('/api/v1/cache/delete'),
    cacheApply: endpoint('/api/v1/cache/apply'),
    cacheReset: endpoint('/api/v1/cache/reset'),
  },
} as const;
