import { createStore, createEvent, sample } from 'effector';
import { $selectedCacheNode } from './cache_data';
import { updateCacheNode, addChildToCache } from './events';

export const openValueModal = createEvent();
export const closeValueModal = createEvent();
export const openAddChildModal = createEvent();
export const closeAddChildModal = createEvent();
export const saveNodeValue = createEvent<string>();
export const saveChildNode = createEvent<string>();

export const $isValueModalOpen = createStore<boolean>(false);
export const $isAddChildModalOpen = createStore<boolean>(false);

// ________________________________  Управление модальными окнами ________________________________

// Открытие модалки значения (только если выбран узел)
sample({
  clock: openValueModal,
  source: $selectedCacheNode,
  filter: Boolean,
  fn: () => true,
  target: $isValueModalOpen,
});

// Открытие модалки добавления дочернего узла (только если выбран узел)
sample({
  clock: openAddChildModal,
  source: $selectedCacheNode,
  filter: Boolean,
  fn: () => true,
  target: $isAddChildModalOpen,
});

// Закрытие модалок вручную или после сохранения
sample({
  clock: [closeValueModal, saveNodeValue],
  fn: () => false,
  target: $isValueModalOpen,
});

sample({
  clock: [closeAddChildModal, saveChildNode],
  fn: () => false,
  target: $isAddChildModalOpen,
});

//  Сохранение значения узла

sample({
  clock: saveNodeValue,
  source: $selectedCacheNode,
  filter: Boolean,
  fn: (selectedNodeId, value) => ({ id: selectedNodeId!, value }),
  target: updateCacheNode,
});

//  Сохранение дочернего узла

sample({
  clock: saveChildNode,
  source: $selectedCacheNode,
  filter: Boolean,
  fn: (selectedNodeId, name) => ({ parentId: selectedNodeId!, name }),
  target: addChildToCache,
});
