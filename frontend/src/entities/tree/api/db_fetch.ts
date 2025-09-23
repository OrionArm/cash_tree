import { createEffect } from 'effector';
import type { TreeNode } from '../model/types';
import { API_CONFIG } from '@/shared/config/api';

const fetchDb = async (): Promise<TreeNode[]> => {
  const response = await fetch(API_CONFIG.ENDPOINTS.tree);
  if (!response.ok) {
    throw new Error('Ошибка при загрузке узлов из БД');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [data];
};

export const fetchDbDataFx = createEffect(fetchDb);
