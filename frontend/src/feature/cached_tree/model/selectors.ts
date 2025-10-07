import { combine } from 'effector';
import { $selectedCacheNode, $cache } from './cache_data';
import { buildNodeMap } from '../lib/tree_map_helpers';

/**
 * Вычисляемые сторы (derived stores)
 * Автоматически пересчитываются при изменении $cache
 */

// Map узлов для O(1) доступа по ID
export const $nodeMap = $cache.map(buildNodeMap);

// Выбранный узел
export const $selectedNode = combine($nodeMap, $selectedCacheNode, (nodeMap, selectedId) => {
  return selectedId ? nodeMap.get(selectedId) || null : null;
});
