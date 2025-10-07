import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';
import type { OperationResult } from '../model/api_types';

export interface CacheUpdateRequest {
  elementId: string;
  value: string;
}

export type CacheUpdateResponse = OperationResult;

const cacheUpdate = async (data: CacheUpdateRequest): Promise<CacheUpdateResponse> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheUpdate, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Ошибка при обновлении элемента в кэше');
  }

  return (await response.json()) as CacheUpdateResponse;
};

export const cacheUpdateFx = createEffect<CacheUpdateRequest, CacheUpdateResponse>(cacheUpdate);
