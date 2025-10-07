import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';
import type { LoadResult } from '../model/api_types';

export type LoadToCacheResponse = LoadResult;

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

  return (await response.json()) as LoadToCacheResponse;
};

export const loadToCacheFx = createEffect(loadToCache);
