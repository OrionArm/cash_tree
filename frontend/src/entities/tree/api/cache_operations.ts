import { createEffect } from 'effector';
import { API_CONFIG } from '@/shared/config/api';
import type { OperationsList } from '../model/api_types';

export type CacheOperationsResponse = OperationsList;

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

  return (await response.json()) as CacheOperationsResponse;
});
