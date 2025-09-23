import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';

export interface CacheDeleteRequest {
  elementId: string;
}

export interface CacheDeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

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

  return await response.json();
};

export const cacheDeleteFx = createEffect<CacheDeleteRequest, CacheDeleteResponse>(cacheDelete);
