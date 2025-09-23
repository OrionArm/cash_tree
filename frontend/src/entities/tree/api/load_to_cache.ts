import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';

export interface LoadToCacheResponse {
  success: boolean;
  message: string;
  error?: string;
}

const loadToCache = async (elementId: string): Promise<LoadToCacheResponse> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheLoad, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ elementId }),
  });

  if (!response.ok) {
    throw new Error('Ошибка при загрузке узла в кэш');
  }

  return await response.json();
};

export const loadToCacheFx = createEffect(loadToCache);
