import type { TreeNode } from '../model/api_types';
import { API_CONFIG } from '@/shared/config/api';
import { createEffect } from 'effector';

const fetchCache = async (): Promise<TreeNode[]> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.cacheTree);
  if (!response.ok) {
    throw new Error('Ошибка при загрузке узлов из кэша');
  }

  const data = (await response.json()) as TreeNode | TreeNode[];
  return Array.isArray(data) ? data : [data];
};

export const fetchCacheFx = createEffect(fetchCache);
