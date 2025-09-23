import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';

export interface CacheResetResponse {
  success: boolean;
  message: string;
  error?: string;
}

const cacheReset = async (): Promise<CacheResetResponse> => {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.cacheReset, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Ошибка при сбросе кэша: ${response.status} ${response.statusText} - ${errorData.message || 'Неизвестная ошибка'}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Cache reset error:', error);
    throw error;
  }
};

export const cacheResetFx = createEffect<void, CacheResetResponse>(() => cacheReset());
