import { combine } from 'effector';
import { $selectedCacheNode, $cache } from './cache_data';
import { buildNodeMap } from '../lib/tree_map_helpers';

export const $nodeMap = $cache.map(buildNodeMap);

export const $selectedNode = combine($nodeMap, $selectedCacheNode, (nodeMap, selectedId) => {
  return selectedId ? nodeMap.get(selectedId) || null : null;
});
