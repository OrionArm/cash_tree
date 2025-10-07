import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';
import type { OperationResult } from '../model/api_types';

export interface CacheDeleteRequest {
  elementId: string;
}

export type CacheDeleteResponse = OperationResult;

const cacheDelete = async (data: CacheDeleteRequest): Promise<CacheDeleteResponse> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheDelete, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Ошибка при удалении элемента из кэша');
  }

  return (await response.json()) as CacheDeleteResponse;
};

export const cacheDeleteFx = createEffect<CacheDeleteRequest, CacheDeleteResponse>(cacheDelete);
