import { createStore, createEvent, sample } from 'effector';
import {
  type TreeNode,
  fetchCacheFx,
  loadToCacheFx,
  fetchCacheOperationsFx,
  loadToCache,
} from '@/entities/tree';

export const fetchCacheData = createEvent();
export const selectCacheNode = createEvent<string | null>();
export const fetchOperations = createEvent();

export const $cache = createStore<TreeNode[]>([]);
export const $selectedCacheNode = createStore<string | null>(null);
export const $isLoading = fetchCacheFx.pending;
export const $hasOperations = createStore<boolean>(false);

// ________________________________  Выбор узла ________________________________

sample({
  clock: selectCacheNode,
  target: $selectedCacheNode,
});

// ________________________________  Загрузка данных в кэш ________________________________

sample({
  clock: loadToCache,
  target: loadToCacheFx,
});

// После успешного выполнения loadToCacheFx автоматически загружаем свежие данные в кэш
sample({
  clock: loadToCacheFx.done,
  target: fetchCacheData,
});

// ________________________________  Загрузка данных из кэша ________________________________

sample({
  clock: fetchCacheData,
  target: fetchCacheFx,
});

sample({
  clock: fetchCacheFx.doneData,
  target: $cache,
});

// Загружаем операции после загрузки данных кэша
sample({
  clock: fetchCacheFx.done,
  target: fetchOperations,
});

// ________________________________  Загрузка операций ________________________________

sample({
  clock: fetchOperations,
  target: fetchCacheOperationsFx,
});

sample({
  clock: fetchCacheOperationsFx.doneData,
  fn: (response) => response.hasOperations,
  target: $hasOperations,
});
