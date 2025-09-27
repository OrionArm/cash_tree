import { createStore, createEvent, sample } from 'effector';
import {
  loadToCacheFx,
  type TreeNode,
  applyCacheFx,
  fetchCashFx,
  cacheCreateFx,
  cacheUpdateFx,
  cacheDeleteFx,
  cacheResetFx,
  fetchDbDataFx,
  loadToCacheEv,
  fetchCacheOperationsFx,
} from '@/entities/tree';
import type { UpdateNodePayload, AddChildPayload } from './types';

export const applyCacheEv = createEvent();
export const addChildToCacheEv = createEvent<AddChildPayload>();
export const updateCacheNodeEv = createEvent<UpdateNodePayload>();
export const removeFromCacheEv = createEvent<string>();
export const resetCacheDataEv = createEvent();
export const fetchCashDataEv = createEvent();
export const selectCacheNodeEv = createEvent<string | null>();
export const fetchOperationsEv = createEvent();

export const openValueModalEv = createEvent();
export const closeValueModalEv = createEvent();
export const openAddChildModalEv = createEvent();
export const closeAddChildModalEv = createEvent();
export const saveNodeValueEv = createEvent<string>();
export const saveChildNodeEv = createEvent<string>();

export const $cacheStore = createStore<TreeNode[]>([]);
export const $selectedCacheNode = createStore<string | null>(null);
export const $isLoading = fetchCashFx.pending;
export const $isValueModalOpen = createStore<boolean>(false);
export const $isAddChildModalOpen = createStore<boolean>(false);
export const $hasOperations = createStore<boolean>(false);

// Выбор узла
sample({
  clock: selectCacheNodeEv,
  target: $selectedCacheNode,
});

// Логика сохранения кэша в БД
sample({
  clock: applyCacheEv,
  target: applyCacheFx,
});

sample({
  clock: applyCacheFx.done,
  target: fetchDbDataFx,
});

// Обновляем состояние операций после применения
sample({
  clock: applyCacheFx.done,
  target: fetchOperationsEv,
});

// ________________________________  Загрузка данных в кэш ________________________________

sample({
  clock: loadToCacheEv,
  target: loadToCacheFx,
});

// После успешного выполнения loadToCacheFx автоматически загружаем свежие данные в кэш
sample({
  clock: loadToCacheFx.done,
  target: fetchCashDataEv,
});

// ________________________________  Загрузка данных из кэша ________________________________

sample({
  clock: fetchCashDataEv,
  target: fetchCashFx,
});

sample({
  clock: fetchCashFx.doneData,
  target: $cacheStore,
});

// Загружаем операции после загрузки данных кэша
sample({
  clock: fetchCashFx.done,
  target: fetchOperationsEv,
});

// ________________________________  Загрузка операций ________________________________

sample({
  clock: fetchOperationsEv,
  target: fetchCacheOperationsFx,
});

sample({
  clock: fetchCacheOperationsFx.doneData,
  fn: (response) => response.hasOperations,
  target: $hasOperations,
});

// ________________________________  Добавление дочернего узла ________________________________

// Вызов API при добавлении дочернего узла в кэш
sample({
  clock: addChildToCacheEv,
  fn: ({ parentId, name }) => ({ parentId, value: name }),
  target: cacheCreateFx,
});

// При ошибке создания дочернего узла в кэше, восстанавливаем данные с сервера
sample({
  clock: cacheCreateFx.failData,
  target: fetchCashDataEv,
});

// Обновляем локальный кэш при успешном создании дочернего узла
sample({
  clock: cacheCreateFx.doneData,
  source: $cacheStore,
  fn: (cacheStore, response) => {
    if (!response.element) return cacheStore;

    const newNode = response.element;
    const parentId = newNode.parentId;

    if (!parentId) {
      return [...cacheStore, newNode];
    }

    const addNodeToParent = (nodes: TreeNode[], parentId: string, node: TreeNode): TreeNode[] => {
      return nodes.map((currentNode) => {
        if (currentNode.id === parentId) {
          return {
            ...currentNode,
            children: [...currentNode.children, node],
          };
        }
        return {
          ...currentNode,
          children: addNodeToParent(currentNode.children, parentId, node),
        };
      });
    };

    return addNodeToParent(cacheStore, parentId, newNode);
  },
  target: $cacheStore,
});

// Обновляем операции после создания узла
sample({
  clock: cacheCreateFx.done,
  target: fetchOperationsEv,
});
// ________________________________ Изменение узла в кэше ________________________________

sample({
  clock: updateCacheNodeEv,
  source: $cacheStore,
  fn: (cacheNodes, { id, value }) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, value };
        }
        return { ...node, children: updateNode(node.children) };
      });
    };
    return updateNode(cacheNodes);
  },
  target: $cacheStore,
});

// Вызов API при обновлении узла в кэше
sample({
  clock: updateCacheNodeEv,
  fn: ({ id, value }) => ({ elementId: id, value }),
  target: cacheUpdateFx,
});

// При ошибке обновления узла в кэше, восстанавливаем данные с сервера
sample({
  clock: cacheUpdateFx.failData,
  target: fetchCashDataEv,
});

// Обновляем операции после обновления узла
sample({
  clock: cacheUpdateFx.done,
  target: fetchOperationsEv,
});

// ________________________________ Логика удаления кэша ________________________________

sample({
  clock: removeFromCacheEv,
  source: $cacheStore,
  fn: (cacheNodes, nodeId) => {
    const markAsDeleted = (nodes: TreeNode[], shouldMark = false): TreeNode[] => {
      return nodes.map((node) => {
        const isTargetNode = node.id === nodeId;
        const markThisNode = shouldMark || isTargetNode;

        return {
          ...node,
          isDeleted: node.isDeleted || markThisNode,
          children: markAsDeleted(node.children, markThisNode),
        };
      });
    };

    return markAsDeleted(cacheNodes);
  },
  target: $cacheStore,
});

// Сбрасываем выделенный элемент при удалении узла
sample({
  clock: removeFromCacheEv,
  fn: () => null,
  target: $selectedCacheNode,
});

// Вызов API при удалении из кэша
sample({
  clock: removeFromCacheEv,
  fn: (nodeId) => ({ elementId: nodeId }),
  target: cacheDeleteFx,
});

// При ошибке удаления из кэша, восстанавливаем данные с сервера
sample({
  clock: cacheDeleteFx.failData,
  target: fetchCashDataEv,
});

// Обновляем операции после удаления узла
sample({
  clock: cacheDeleteFx.done,
  target: fetchOperationsEv,
});

// ________________________________ Логика сброса кэша через API ________________________________

sample({
  clock: resetCacheDataEv,
  target: cacheResetFx,
});

sample({
  clock: resetCacheDataEv,
  fn: () => [],
  target: $cacheStore,
});

sample({
  clock: resetCacheDataEv,
  fn: () => null,
  target: $selectedCacheNode,
});

sample({
  clock: [cacheResetFx.done, cacheResetFx.fail],
  target: fetchDbDataFx,
});

// ________________________________ Логика модальных окон ________________________________

// Управление модальным окном значения
sample({
  clock: openValueModalEv,
  source: $selectedCacheNode,
  filter: (selectedNodeId) => Boolean(selectedNodeId),
  fn: () => true,
  target: $isValueModalOpen,
});

sample({
  clock: closeValueModalEv,
  fn: () => false,
  target: $isValueModalOpen,
});

// Управление модальным окном добавления дочернего узла
sample({
  clock: openAddChildModalEv,
  source: $selectedCacheNode,
  filter: (selectedNodeId) => Boolean(selectedNodeId),
  fn: () => true,
  target: $isAddChildModalOpen,
});

sample({
  clock: closeAddChildModalEv,
  fn: () => false,
  target: $isAddChildModalOpen,
});

// Сохранение значения узла
sample({
  clock: saveNodeValueEv,
  source: $selectedCacheNode,
  filter: (selectedNodeId) => Boolean(selectedNodeId),
  fn: (selectedNodeId, value) => ({ id: selectedNodeId!, value }),
  target: updateCacheNodeEv,
});

sample({
  clock: saveNodeValueEv,
  fn: () => false,
  target: $isValueModalOpen,
});

// Сохранение дочернего узла
sample({
  clock: saveChildNodeEv,
  source: $selectedCacheNode,
  filter: (selectedNodeId) => Boolean(selectedNodeId),
  fn: (selectedNodeId, name) => ({ parentId: selectedNodeId!, name }),
  target: addChildToCacheEv,
});

sample({
  clock: saveChildNodeEv,
  fn: () => false,
  target: $isAddChildModalOpen,
});
