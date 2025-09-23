import { createEffect } from 'effector';
import { API_CONFIG } from '@/shared/config/api';

export interface CacheOperationsResponse {
  operations: any[];
  hasOperations: boolean;
}

export const fetchCacheOperationsFx = createEffect(async (): Promise<CacheOperationsResponse> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheOperations, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
});
