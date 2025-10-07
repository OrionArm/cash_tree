import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';
import type { OperationResult } from '../model/api_types';

export interface CacheCreateRequest {
  parentId?: string | null;
  value: string;
}

export type CacheCreateResponse = OperationResult;

const cacheCreate = async (data: CacheCreateRequest): Promise<CacheCreateResponse> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheCreate, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Ошибка при создании элемента в кэше');
  }

  return (await response.json()) as CacheCreateResponse;
};

export const cacheCreateFx = createEffect<CacheCreateRequest, CacheCreateResponse>(cacheCreate);
