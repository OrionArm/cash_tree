import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';

export type CacheApplyResponse = {
  success: boolean;
  errors: string[];
  message: string;
  deletedElementIds?: string[];
};

const cacheApply = async (): Promise<CacheApplyResponse> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheApply, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Ошибка при применении изменений к базе данных');
  }

  return await response.json();
};

export const applyCacheFx = createEffect<void, CacheApplyResponse>(cacheApply);
