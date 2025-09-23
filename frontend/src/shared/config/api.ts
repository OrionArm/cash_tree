const isDev = import.meta.env.DEV;
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_CONFIG = {
  BASE_URL: isDev ? '' : API_BASE_URL,
  ENDPOINTS: {
    tree: isDev ? '/api/v1/tree' : `${API_BASE_URL}/api/v1/tree`,
  },
} as const;
