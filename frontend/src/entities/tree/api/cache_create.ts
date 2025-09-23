import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';

export interface CacheCreateRequest {
  parentId?: string | null;
  value: string;
}

import type { TreeNode } from '../model/types';

export interface CacheCreateResponse {
  success: boolean;
  message: string;
  element?: TreeNode;
  error?: string;
}

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

  return await response.json();
};

export const cacheCreateFx = createEffect<CacheCreateRequest, CacheCreateResponse>(cacheCreate);
