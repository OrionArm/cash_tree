import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';

export interface CacheUpdateRequest {
  elementId: string;
  value: string;
}

export interface CacheUpdateResponse {
  success: boolean;
  message: string;
  error?: string;
}

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

  return await response.json();
};

export const cacheUpdateFx = createEffect<CacheUpdateRequest, CacheUpdateResponse>(cacheUpdate);
