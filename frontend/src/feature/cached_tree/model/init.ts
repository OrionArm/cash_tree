import { sample } from 'effector';
import {
  applyCacheFx,
  cacheCreateFx,
  cacheUpdateFx,
  cacheDeleteFx,
  cacheResetFx,
  fetchDbDataFx,
} from '@/entities/tree';
import { markNodesAsDeleted, addChildToNode, updateNodeValue } from '../lib/tree_array_helpers';
import { $cache, $selectedCacheNode, fetchCacheData, fetchOperations } from './cache_data';
import {
  applyCache,
  addChildToCache,
  updateCacheNode,
  removeFromCache,
  resetCacheData,
} from './events';

// ================================ Сохранение кэша в БД ================================

sample({
  clock: applyCache,
  target: applyCacheFx,
});

sample({
  clock: applyCacheFx.done,
  target: fetchDbDataFx,
});

sample({
  clock: applyCacheFx.done,
  target: fetchOperations,
});

// Синхронизируем кэш на фронте: помечаем элементы как удалённые
sample({
  clock: applyCacheFx.doneData,
  source: $cache,
  fn: (cacheStore, response) => {
    const deletedIds = response.deletedElementIds;
    if (!deletedIds || !deletedIds.length) return cacheStore;

    const deletedSet = new Set(deletedIds);
    return markNodesAsDeleted(cacheStore, (node) => deletedSet.has(node.id));
  },
  target: $cache,
});

// ================================ Добавление дочернего узла ================================

sample({
  clock: addChildToCache,
  fn: ({ parentId, name }) => ({ parentId, value: name }),
  target: cacheCreateFx,
});

sample({
  clock: cacheCreateFx.doneData,
  source: $cache,
  fn: (cacheStore, response) => {
    if (!response.element) return cacheStore;

    const newNode = response.element;
    const parentId = newNode.parentId;

    if (!parentId) {
      return [...cacheStore, newNode];
    }

    return addChildToNode(cacheStore, parentId, newNode);
  },
  target: $cache,
});

// ================================ Изменение узла в кэше ================================

sample({
  clock: updateCacheNode,
  source: $cache,
  fn: (cacheNodes, { id, value }) => updateNodeValue(cacheNodes, id, value),
  target: $cache,
});

sample({
  clock: updateCacheNode,
  fn: ({ id, value }) => ({ elementId: id, value }),
  target: cacheUpdateFx,
});

// ================================ Удаление узла ================================

sample({
  clock: removeFromCache,
  source: $cache,
  fn: (cacheNodes, nodeId) => {
    return markNodesAsDeleted(
      cacheNodes,
      (node, parentDeleted) => node.id === nodeId || parentDeleted,
    );
  },
  target: $cache,
});

sample({
  clock: removeFromCache,
  fn: () => null,
  target: $selectedCacheNode,
});

sample({
  clock: removeFromCache,
  fn: (nodeId) => ({ elementId: nodeId }),
  target: cacheDeleteFx,
});

// ================================ Сброс кэша ================================

sample({
  clock: resetCacheData,
  target: cacheResetFx,
});

sample({
  clock: resetCacheData,
  fn: () => [],
  target: $cache,
});

sample({
  clock: resetCacheData,
  fn: () => null,
  target: $selectedCacheNode,
});

sample({
  clock: [cacheResetFx.done, cacheResetFx.fail],
  target: fetchDbDataFx,
});

// ================================ Общие обработчики ================================

// Автоматическое обновление операций после всех изменений кэша
sample({
  clock: [cacheCreateFx.done, cacheUpdateFx.done, cacheDeleteFx.done],
  target: fetchOperations,
});

// Восстановление данных с сервера при ошибках операций
sample({
  clock: [cacheCreateFx.failData, cacheUpdateFx.failData, cacheDeleteFx.failData],
  target: fetchCacheData,
});
