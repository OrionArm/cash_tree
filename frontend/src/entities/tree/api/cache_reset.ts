import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';
import type { OperationResult } from '../model/api_types';

export type CacheResetResponse = OperationResult;

const cacheReset = async (): Promise<CacheResetResponse> => {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.cacheReset, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(
        `Ошибка при сбросе кэша: ${response.status} ${response.statusText} - ${errorData.message || 'Неизвестная ошибка'}`,
      );
    }

    return (await response.json()) as CacheResetResponse;
  } catch (error) {
    console.error('Cache reset error:', error);
    throw error;
  }
};

export const cacheResetFx = createEffect<void, CacheResetResponse>(() => cacheReset());
