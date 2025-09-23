import { fetchDbDataFx, type TreeNode } from '@/entities/tree';
import { createEvent, createStore, sample } from 'effector';

export const fetchDbData = createEvent();
export const selectDbNode = createEvent<string | null>();

export const $dbStore = createStore<TreeNode[]>([]);
export const $selectedDbNode = createStore<string | null>(null);
export const $isLoading = fetchDbDataFx.pending;

sample({
  clock: fetchDbData,
  target: fetchDbDataFx,
});

sample({
  clock: fetchDbDataFx.doneData,
  target: $dbStore,
});

sample({
  clock: selectDbNode,
  target: $selectedDbNode,
});
