import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';
import type { ApplyChangesResponse } from '../model/api_types';

export type CacheApplyResponse = ApplyChangesResponse;

const cacheApply = async (): Promise<CacheApplyResponse> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheApply, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Ошибка при применении изменений к базе данных');
  }

  return (await response.json()) as CacheApplyResponse;
};

export const applyCacheFx = createEffect<void, CacheApplyResponse>(cacheApply);
